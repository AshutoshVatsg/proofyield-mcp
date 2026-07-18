// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Like {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

/// @notice Dependency-free ERC-4626-compatible vault for testnet demos only.
/// Direct test-token donations increase assets per share and can simulate yield.
/// This contract has not been independently audited and must never hold real assets.
contract MockYieldVault {
    string public constant name = "ProofYield Conservative Vault Share";
    string public constant symbol = "pyUSDC";

    IERC20Like private immutable _asset;
    uint8 public immutable decimals;
    address public owner;
    bool public depositsPaused;
    uint256 public totalSupply;
    uint256 private _entered;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(
        address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares
    );
    event DepositsPaused(bool paused);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error Unauthorized();
    error InvalidAddress();
    error InvalidAmount();
    error DepositsArePaused();
    error InsufficientBalance();
    error InsufficientAllowance();
    error TokenTransferFailed();
    error Reentrancy();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (_entered != 0) revert Reentrancy();
        _entered = 1;
        _;
        _entered = 0;
    }

    constructor(address asset_) {
        if (asset_ == address(0) || asset_.code.length == 0) revert InvalidAddress();
        _asset = IERC20Like(asset_);
        decimals = IERC20Like(asset_).decimals();
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function asset() external view returns (address) {
        return address(_asset);
    }

    function totalAssets() public view returns (uint256) {
        return _asset.balanceOf(address(this));
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        uint256 managed = totalAssets();
        return supply == 0 || managed == 0 ? assets : assets * supply / managed;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        return supply == 0 ? shares : shares * totalAssets() / supply;
    }

    function maxDeposit(address) external view returns (uint256) {
        return depositsPaused ? 0 : type(uint256).max;
    }

    function maxMint(address) external view returns (uint256) {
        return depositsPaused ? 0 : type(uint256).max;
    }

    function maxWithdraw(address account) external view returns (uint256) {
        return convertToAssets(balanceOf[account]);
    }

    function maxRedeem(address account) external view returns (uint256) {
        return balanceOf[account];
    }

    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) external view returns (uint256) {
        return _convertToAssetsUp(shares);
    }

    function previewWithdraw(uint256 assets) external view returns (uint256) {
        return _convertToSharesUp(assets);
    }

    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        if (spender == address(0)) revert InvalidAddress();
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transferShares(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transferShares(from, to, amount);
        return true;
    }

    function deposit(uint256 assets, address receiver) external nonReentrant returns (uint256 shares) {
        if (depositsPaused) revert DepositsArePaused();
        if (assets == 0 || receiver == address(0)) revert InvalidAmount();
        shares = convertToShares(assets);
        if (shares == 0) revert InvalidAmount();
        _safeTransferFrom(msg.sender, address(this), assets);
        _mint(receiver, shares);
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function mint(uint256 shares, address receiver) external nonReentrant returns (uint256 assets) {
        if (depositsPaused) revert DepositsArePaused();
        if (shares == 0 || receiver == address(0)) revert InvalidAmount();
        assets = _convertToAssetsUp(shares);
        _safeTransferFrom(msg.sender, address(this), assets);
        _mint(receiver, shares);
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function withdraw(uint256 assets, address receiver, address account)
        external
        nonReentrant
        returns (uint256 shares)
    {
        if (assets == 0 || receiver == address(0) || account == address(0)) {
            revert InvalidAmount();
        }
        shares = _convertToSharesUp(assets);
        if (msg.sender != account) _spendAllowance(account, msg.sender, shares);
        _burn(account, shares);
        _safeTransfer(receiver, assets);
        emit Withdraw(msg.sender, receiver, account, assets, shares);
    }

    function redeem(uint256 shares, address receiver, address account) external nonReentrant returns (uint256 assets) {
        if (shares == 0 || receiver == address(0) || account == address(0)) revert InvalidAmount();
        if (msg.sender != account) _spendAllowance(account, msg.sender, shares);
        assets = convertToAssets(shares);
        if (assets == 0) revert InvalidAmount();
        _burn(account, shares);
        _safeTransfer(receiver, assets);
        emit Withdraw(msg.sender, receiver, account, assets, shares);
    }

    function setDepositsPaused(bool paused) external onlyOwner {
        depositsPaused = paused;
        emit DepositsPaused(paused);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        if (nextOwner == address(0)) revert InvalidAddress();
        emit OwnershipTransferred(owner, nextOwner);
        owner = nextOwner;
    }

    function _convertToSharesUp(uint256 assets) private view returns (uint256) {
        uint256 supply = totalSupply;
        uint256 managed = totalAssets();
        if (supply == 0 || managed == 0) return assets;
        return (assets * supply + managed - 1) / managed;
    }

    function _convertToAssetsUp(uint256 shares) private view returns (uint256) {
        uint256 supply = totalSupply;
        uint256 managed = totalAssets();
        if (supply == 0 || managed == 0) return shares;
        return (shares * managed + supply - 1) / supply;
    }

    function _mint(address to, uint256 amount) private {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) private {
        if (balanceOf[from] < amount) revert InsufficientBalance();
        unchecked {
            balanceOf[from] -= amount;
            totalSupply -= amount;
        }
        emit Transfer(from, address(0), amount);
    }

    function _transferShares(address from, address to, uint256 amount) private {
        if (to == address(0)) revert InvalidAddress();
        if (balanceOf[from] < amount) revert InsufficientBalance();
        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }

    function _spendAllowance(address account, address spender, uint256 amount) private {
        uint256 current = allowance[account][spender];
        if (current != type(uint256).max) {
            if (current < amount) revert InsufficientAllowance();
            unchecked {
                allowance[account][spender] = current - amount;
            }
            emit Approval(account, spender, allowance[account][spender]);
        }
    }

    function _safeTransfer(address to, uint256 amount) private {
        (bool ok, bytes memory data) = address(_asset).call(abi.encodeCall(IERC20Like.transfer, (to, amount)));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenTransferFailed();
    }

    function _safeTransferFrom(address from, address to, uint256 amount) private {
        (bool ok, bytes memory data) = address(_asset).call(abi.encodeCall(IERC20Like.transferFrom, (from, to, amount)));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenTransferFailed();
    }
}
