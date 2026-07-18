import { ConfigService } from '@nitrostack/core';
import { ChainConfig, ChainId } from './schemas.js';
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
export declare class ProofYieldConfigService {
    private readonly config;
    constructor(config: ConfigService);
    private getFirst;
    private getAddress;
    private getInteger;
    getChainConfig(chainId: ChainId | number | string): ChainConfig;
    getAllChainConfigs(): ChainConfig[];
    isRpcConfigured(chainId: ChainId | number | string): boolean;
    isConfigured(chainId: ChainId | number | string): boolean;
    getAdapter(protocolId: string, chainId: ChainId): AdapterConfig | undefined;
    isTrustedTarget(protocolId: string, chainId: ChainId, targetAddress?: string): boolean;
    getPublicConfiguration(): {
        chainId: 11155111 | 84532 | 80002;
        name: string;
        rpcConfigured: boolean;
        usdcConfigured: boolean;
        adapters: {
            aaveV3: boolean;
            demoErc4626: boolean;
        };
    }[];
}
//# sourceMappingURL=config.service.d.ts.map