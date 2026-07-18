param(
    [string]$AccountName = 'proofyield-deployer'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$workspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$forge = Join-Path $workspace '.tools\foundry\v1.7.1\forge.exe'
$cast = Join-Path $workspace '.tools\foundry\v1.7.1\cast.exe'
$envFile = Join-Path $workspace '.env'

if (-not (Test-Path -LiteralPath $forge) -or -not (Test-Path -LiteralPath $cast)) {
    throw 'Foundry v1.7.1 is not installed in .tools/foundry/v1.7.1.'
}

$values = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
    if ($_ -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
        $values[$matches[1]] = $matches[2].Trim()
    }
}

$rpc = $values['BASE_SEPOLIA_RPC_URL']
$usdc = $values['BASE_SEPOLIA_USDC_ADDRESS']
if (-not $rpc -or -not $usdc) {
    throw 'BASE_SEPOLIA_RPC_URL and BASE_SEPOLIA_USDC_ADDRESS must be configured.'
}

$chainId = & $cast chain-id --rpc-url $rpc
if ($LASTEXITCODE -ne 0 -or $chainId -ne '84532') {
    throw "RPC must report Base Sepolia chain ID 84532; received $chainId."
}

function Set-DotEnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $lines = [System.Collections.Generic.List[string]]::new()
    Get-Content -LiteralPath $Path | ForEach-Object { [void]$lines.Add($_) }
    $updated = $false
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match "^$([regex]::Escape($Name))=") {
            $lines[$index] = "$Name=$Value"
            $updated = $true
            break
        }
    }
    if (-not $updated) { [void]$lines.Add("$Name=$Value") }

    [System.IO.File]::WriteAllLines($Path, $lines, [System.Text.UTF8Encoding]::new($false))
}

Push-Location $workspace
try {
    & $forge test
    if ($LASTEXITCODE -ne 0) { throw 'Vault tests failed; deployment blocked.' }

    Write-Host "Deploying MockYieldVault with encrypted Foundry account '$AccountName'..."
    # --constructor-args is variadic in Forge and must remain last; otherwise it
    # consumes subsequent deployment flags and Forge falls back to localhost.
    $deployOutput = [System.Collections.Generic.List[string]]::new()
    & $forge create `
        --account $AccountName `
        --broadcast `
        --rpc-url $rpc `
        'contracts/MockYieldVault.sol:MockYieldVault' `
        --constructor-args $usdc 2>&1 | ForEach-Object {
            $line = "$_"
            [void]$deployOutput.Add($line)
            Write-Host $line
        }
    if ($LASTEXITCODE -ne 0) { throw 'Foundry deployment failed.' }

    $vaultAddress = $null
    foreach ($line in $deployOutput) {
        if ($line -match 'Deployed to:\s*(0x[a-fA-F0-9]{40})') {
            $vaultAddress = $matches[1]
            break
        }
    }
    if (-not $vaultAddress) { throw 'Deployment succeeded but the deployed address could not be parsed.' }

    $code = $null
    for ($attempt = 1; $attempt -le 10; $attempt++) {
        $code = & $cast code $vaultAddress --rpc-url $rpc
        if ($LASTEXITCODE -eq 0 -and $code -and $code -ne '0x') { break }
        if ($attempt -lt 10) {
            Write-Host "Waiting for deployed bytecode to propagate (attempt $attempt/10)..."
            Start-Sleep -Seconds 2
        }
    }
    if (-not $code -or $code -eq '0x') {
        throw "No deployed bytecode found at $vaultAddress."
    }

    $deployedAsset = & $cast call $vaultAddress 'asset()(address)' --rpc-url $rpc
    $deployedOwner = & $cast call $vaultAddress 'owner()(address)' --rpc-url $rpc
    if ($LASTEXITCODE -ne 0 -or $deployedAsset.Trim().ToLowerInvariant() -ne $usdc.ToLowerInvariant()) {
        throw "Vault asset verification failed; received $deployedAsset."
    }

    Set-DotEnvValue -Path $envFile -Name 'BASE_SEPOLIA_DEMO_VAULT_ADDRESS' -Value $vaultAddress
    Set-DotEnvValue -Path $envFile -Name 'DEMO_VAULT_APY_BPS' -Value '650'
    Set-DotEnvValue -Path $envFile -Name 'DEMO_VAULT_RISK_SCORE' -Value '45'

    Write-Host "Verified vault asset: $deployedAsset"
    Write-Host "Verified vault owner: $deployedOwner"
    Write-Host "Configured BASE_SEPOLIA_DEMO_VAULT_ADDRESS=$vaultAddress in .env"
} finally {
    Pop-Location
}
