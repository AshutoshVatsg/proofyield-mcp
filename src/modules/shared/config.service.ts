import { Injectable, ConfigService } from '@nitrostack/core';
import { isAddress } from 'viem';
import { ChainConfig, ChainConfigSchema, ChainId, EvmAddressSchema, SUPPORTED_CHAIN_IDS } from './schemas.js';

export interface AdapterConfig {
  protocolId: 'aave-v3' | 'demo-erc4626';
  chainId: ChainId;
  assetAddress: `0x${string}`;
  targetAddress: `0x${string}`;
  dataProviderAddress?: `0x${string}`;
  rateMode: 'OBSERVED_TESTNET' | 'CONTROLLED_SIMULATION';
  controlledApyBps?: number;
  controlledRiskScore?: number;
}

@Injectable({ deps: [ConfigService] })
export class ProofYieldConfigService {
  constructor(private readonly config: ConfigService) {}

  private getFirst(...keys: string[]): string | undefined {
    for (const key of keys) {
      const value = this.config.get<string>(key);
      if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    }
    return undefined;
  }

  private getAddress(...keys: string[]): `0x${string}` | undefined {
    const value = this.getFirst(...keys);
    return value && isAddress(value) ? EvmAddressSchema.parse(value) as `0x${string}` : undefined;
  }

  private getInteger(key: string, fallback: number, min: number, max: number): number {
    const raw = this.getFirst(key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
  }

  getChainConfig(chainId: ChainId | number | string): ChainConfig {
    const normalized = Number(chainId);
    let value: ChainConfig;

    switch (normalized) {
      case 11155111:
        value = {
          chainId: 11155111,
          name: 'Ethereum Sepolia',
          rpcUrl: this.getFirst('ETHEREUM_SEPOLIA_RPC_URL'),
          usdcAddress: this.getAddress('ETHEREUM_SEPOLIA_USDC_ADDRESS', 'USDC_ETHEREUM_SEPOLIA_ADDRESS'),
          aavePoolAddress: this.getAddress('AAVE_ETHEREUM_SEPOLIA_POOL_ADDRESS', 'AAVE_POOL_ETHEREUM_SEPOLIA_ADDRESS'),
          aaveDataProviderAddress: this.getAddress('AAVE_DATA_PROVIDER_ETHEREUM_SEPOLIA_ADDRESS'),
        };
        break;
      case 84532:
        value = {
          chainId: 84532,
          name: 'Base Sepolia',
          rpcUrl: this.getFirst('BASE_SEPOLIA_RPC_URL'),
          usdcAddress: this.getAddress('BASE_SEPOLIA_USDC_ADDRESS', 'USDC_BASE_SEPOLIA_ADDRESS'),
          aavePoolAddress: this.getAddress('AAVE_BASE_SEPOLIA_POOL_ADDRESS', 'AAVE_POOL_BASE_SEPOLIA_ADDRESS'),
          aaveDataProviderAddress: this.getAddress('AAVE_DATA_PROVIDER_BASE_SEPOLIA_ADDRESS'),
          demoVaultAddress: this.getAddress('BASE_SEPOLIA_DEMO_VAULT_ADDRESS', 'DEMO_VAULT_BASE_SEPOLIA_ADDRESS'),
        };
        break;
      case 80002:
        value = {
          chainId: 80002,
          name: 'Polygon Amoy',
          rpcUrl: this.getFirst('POLYGON_AMOY_RPC_URL'),
          usdcAddress: this.getAddress('POLYGON_AMOY_USDC_ADDRESS', 'USDC_POLYGON_AMOY_ADDRESS'),
          demoVaultAddress: this.getAddress('AMOY_ERC4626_VAULT_ADDRESS', 'DEMO_VAULT_POLYGON_AMOY_ADDRESS'),
        };
        break;
      default:
        throw new Error(`Unsupported chain ID: ${String(chainId)}`);
    }

    return ChainConfigSchema.parse(value);
  }

  getAllChainConfigs(): ChainConfig[] {
    return SUPPORTED_CHAIN_IDS.map((chainId) => this.getChainConfig(chainId));
  }

  isRpcConfigured(chainId: ChainId | number | string): boolean {
    try {
      return Boolean(this.getChainConfig(chainId).rpcUrl);
    } catch {
      return false;
    }
  }

  isConfigured(chainId: ChainId | number | string): boolean {
    return this.isRpcConfigured(chainId);
  }

  getAdapter(protocolId: string, chainId: ChainId): AdapterConfig | undefined {
    const chain = this.getChainConfig(chainId);
    if (!chain.rpcUrl || !chain.usdcAddress) return undefined;

    if (protocolId === 'aave-v3' && chain.aavePoolAddress && chain.aaveDataProviderAddress) {
      return {
        protocolId: 'aave-v3',
        chainId,
        assetAddress: chain.usdcAddress as `0x${string}`,
        targetAddress: chain.aavePoolAddress as `0x${string}`,
        dataProviderAddress: chain.aaveDataProviderAddress as `0x${string}`,
        rateMode: 'OBSERVED_TESTNET',
      };
    }

    if (protocolId === 'demo-erc4626' && chain.demoVaultAddress) {
      return {
        protocolId: 'demo-erc4626',
        chainId,
        assetAddress: chain.usdcAddress as `0x${string}`,
        targetAddress: chain.demoVaultAddress as `0x${string}`,
        rateMode: 'CONTROLLED_SIMULATION',
        controlledApyBps: this.getInteger('DEMO_VAULT_APY_BPS', 650, 0, 100_000),
        controlledRiskScore: this.getInteger('DEMO_VAULT_RISK_SCORE', 45, 0, 100),
      };
    }

    return undefined;
  }

  isTrustedTarget(protocolId: string, chainId: ChainId, targetAddress?: string): boolean {
    if (protocolId === 'do-nothing') return targetAddress === undefined;
    const adapter = this.getAdapter(protocolId, chainId);
    return Boolean(adapter && targetAddress && adapter.targetAddress.toLowerCase() === targetAddress.toLowerCase());
  }

  getPublicConfiguration() {
    return this.getAllChainConfigs().map((chain) => ({
      chainId: chain.chainId,
      name: chain.name,
      rpcConfigured: Boolean(chain.rpcUrl),
      usdcConfigured: Boolean(chain.usdcAddress),
      adapters: {
        aaveV3: Boolean(this.getAdapter('aave-v3', chain.chainId)),
        demoErc4626: Boolean(this.getAdapter('demo-erc4626', chain.chainId)),
      },
    }));
  }
}
