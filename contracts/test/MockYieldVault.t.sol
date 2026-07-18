// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { MockYieldVault } from "../MockYieldVault.sol";

contract TestUSDC {
    string public constant name = "Test USDC";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 permitted = allowance[from][msg.sender];
        require(permitted >= amount, "allowance");
        allowance[from][msg.sender] = permitted - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) private {
        require(balanceOf[from] >= amount, "balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }
}

contract UnauthorizedCaller {
    function pause(MockYieldVault vault) external returns (bool) {
        try vault.setDepositsPaused(true) {
            return true;
        } catch {
            return false;
        }
    }
}

contract MockYieldVaultTest {
    uint256 private constant UNIT = 1e6;
    TestUSDC private token;
    MockYieldVault private vault;

    function setUp() public {
        token = new TestUSDC();
        vault = new MockYieldVault(address(token));
        token.mint(address(this), 1_000 * UNIT);
        token.approve(address(vault), type(uint256).max);
    }

    function testDepositAndWithdrawRoundTrip() public {
        uint256 shares = vault.deposit(100 * UNIT, address(this));
        require(shares == 100 * UNIT, "first deposit shares");
        require(vault.totalAssets() == 100 * UNIT, "deposited assets");

        uint256 burned = vault.withdraw(40 * UNIT, address(this), address(this));
        require(burned == 40 * UNIT, "withdrawn shares");
        require(vault.balanceOf(address(this)) == 60 * UNIT, "remaining shares");
        require(vault.totalAssets() == 60 * UNIT, "remaining assets");
    }

    function testDonationIncreasesAssetsPerShare() public {
        vault.deposit(100 * UNIT, address(this));
        token.mint(address(vault), 10 * UNIT);
        require(vault.convertToAssets(100 * UNIT) == 110 * UNIT, "donation yield");
    }

    function testPauseBlocksDepositsButAllowsWithdrawals() public {
        vault.deposit(100 * UNIT, address(this));
        vault.setDepositsPaused(true);
        require(vault.maxDeposit(address(this)) == 0, "paused max deposit");

        bool reverted;
        try vault.deposit(1 * UNIT, address(this)) {
            reverted = false;
        } catch {
            reverted = true;
        }
        require(reverted, "deposit must revert");
        vault.withdraw(100 * UNIT, address(this), address(this));
        require(vault.totalAssets() == 0, "withdraw remains available");
    }

    function testOnlyOwnerCanPause() public {
        UnauthorizedCaller caller = new UnauthorizedCaller();
        require(!caller.pause(vault), "unauthorized pause");
        require(!vault.depositsPaused(), "pause state unchanged");
    }
}
