import { z } from '@nitrostack/core';
export declare const SUPPORTED_CHAIN_IDS: readonly [11155111, 84532, 80002];
export declare const ZERO_ADDRESS: "0x0000000000000000000000000000000000000000";
export declare const ChainIdSchema: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
export type ChainId = z.infer<typeof ChainIdSchema>;
export declare const EvmAddressSchema: z.ZodString;
export declare const TransactionHashSchema: z.ZodString;
export declare const ContentHashSchema: z.ZodString;
export declare const DecimalAmountSchema: z.ZodString;
export declare const BaseUnitAmountSchema: z.ZodString;
export declare const IsoTimestampSchema: z.ZodString;
export declare const ChainConfigSchema: z.ZodObject<{
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    name: z.ZodString;
    rpcUrl: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    usdcAddress: z.ZodOptional<z.ZodString>;
    aavePoolAddress: z.ZodOptional<z.ZodString>;
    aaveDataProviderAddress: z.ZodOptional<z.ZodString>;
    demoVaultAddress: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    chainId: 11155111 | 84532 | 80002;
    name: string;
    rpcUrl?: string | undefined;
    usdcAddress?: string | undefined;
    aavePoolAddress?: string | undefined;
    aaveDataProviderAddress?: string | undefined;
    demoVaultAddress?: string | undefined;
}, {
    chainId: 11155111 | 84532 | 80002;
    name: string;
    rpcUrl?: string | undefined;
    usdcAddress?: string | undefined;
    aavePoolAddress?: string | undefined;
    aaveDataProviderAddress?: string | undefined;
    demoVaultAddress?: string | undefined;
}>;
export type ChainConfig = z.infer<typeof ChainConfigSchema>;
export declare const ProvenanceSchema: z.ZodObject<{
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    blockNumber: z.ZodString;
    timestamp: z.ZodString;
    sourceId: z.ZodString;
    adapterVersion: z.ZodString;
    contractAddress: z.ZodOptional<z.ZodString>;
    dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
    confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
}, "strict", z.ZodTypeAny, {
    chainId: 11155111 | 84532 | 80002;
    blockNumber: string;
    timestamp: string;
    sourceId: string;
    adapterVersion: string;
    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
    confidence: "HIGH" | "MEDIUM" | "LOW";
    contractAddress?: string | undefined;
}, {
    chainId: 11155111 | 84532 | 80002;
    blockNumber: string;
    timestamp: string;
    sourceId: string;
    adapterVersion: string;
    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
    confidence: "HIGH" | "MEDIUM" | "LOW";
    contractAddress?: string | undefined;
}>;
export type Provenance = z.infer<typeof ProvenanceSchema>;
export declare const TokenBalanceSchema: z.ZodObject<{
    symbol: z.ZodString;
    address: z.ZodString;
    amount: z.ZodString;
    amountBaseUnits: z.ZodString;
    decimals: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    symbol: string;
    address: string;
    amount: string;
    amountBaseUnits: string;
    decimals: number;
}, {
    symbol: string;
    address: string;
    amount: string;
    amountBaseUnits: string;
    decimals: number;
}>;
export type TokenBalance = z.infer<typeof TokenBalanceSchema>;
export declare const ProtocolPositionSchema: z.ZodObject<{
    protocolId: z.ZodString;
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    assetSymbol: z.ZodString;
    amount: z.ZodString;
    contractAddress: z.ZodString;
    provenance: z.ZodObject<{
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        blockNumber: z.ZodString;
        timestamp: z.ZodString;
        sourceId: z.ZodString;
        adapterVersion: z.ZodString;
        contractAddress: z.ZodOptional<z.ZodString>;
        dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
    }, "strict", z.ZodTypeAny, {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    }, {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    chainId: 11155111 | 84532 | 80002;
    contractAddress: string;
    amount: string;
    protocolId: string;
    assetSymbol: string;
    provenance: {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    };
}, {
    chainId: 11155111 | 84532 | 80002;
    contractAddress: string;
    amount: string;
    protocolId: string;
    assetSymbol: string;
    provenance: {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    };
}>;
export declare const ChainWalletResultSchema: z.ZodObject<{
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    chainName: z.ZodString;
    status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "ERROR"]>;
    blockNumber: z.ZodOptional<z.ZodString>;
    nativeBalance: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        symbol: z.ZodString;
        address: z.ZodString;
        amount: z.ZodString;
        amountBaseUnits: z.ZodString;
        decimals: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        symbol: string;
        address: string;
        amount: string;
        amountBaseUnits: string;
        decimals: number;
    }, {
        symbol: string;
        address: string;
        amount: string;
        amountBaseUnits: string;
        decimals: number;
    }>, "many">>;
    positions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        protocolId: z.ZodString;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        assetSymbol: z.ZodString;
        amount: z.ZodString;
        contractAddress: z.ZodString;
        provenance: z.ZodObject<{
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            blockNumber: z.ZodString;
            timestamp: z.ZodString;
            sourceId: z.ZodString;
            adapterVersion: z.ZodString;
            contractAddress: z.ZodOptional<z.ZodString>;
            dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
            confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        }, "strict", z.ZodTypeAny, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }>;
    }, "strict", z.ZodTypeAny, {
        chainId: 11155111 | 84532 | 80002;
        contractAddress: string;
        amount: string;
        protocolId: string;
        assetSymbol: string;
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
    }, {
        chainId: 11155111 | 84532 | 80002;
        contractAddress: string;
        amount: string;
        protocolId: string;
        assetSymbol: string;
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
    }>, "many">>;
    observedTimestamp: z.ZodString;
    provenance: z.ZodOptional<z.ZodObject<{
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        blockNumber: z.ZodString;
        timestamp: z.ZodString;
        sourceId: z.ZodString;
        adapterVersion: z.ZodString;
        contractAddress: z.ZodOptional<z.ZodString>;
        dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
    }, "strict", z.ZodTypeAny, {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    }, {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    }>>;
    errorCode: z.ZodOptional<z.ZodString>;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
    chainId: 11155111 | 84532 | 80002;
    chainName: string;
    assets: {
        symbol: string;
        address: string;
        amount: string;
        amountBaseUnits: string;
        decimals: number;
    }[];
    positions: {
        chainId: 11155111 | 84532 | 80002;
        contractAddress: string;
        amount: string;
        protocolId: string;
        assetSymbol: string;
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
    }[];
    observedTimestamp: string;
    blockNumber?: string | undefined;
    provenance?: {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    } | undefined;
    nativeBalance?: string | undefined;
    errorCode?: string | undefined;
    errorMessage?: string | undefined;
}, {
    status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
    chainId: 11155111 | 84532 | 80002;
    chainName: string;
    observedTimestamp: string;
    blockNumber?: string | undefined;
    provenance?: {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    } | undefined;
    nativeBalance?: string | undefined;
    assets?: {
        symbol: string;
        address: string;
        amount: string;
        amountBaseUnits: string;
        decimals: number;
    }[] | undefined;
    positions?: {
        chainId: 11155111 | 84532 | 80002;
        contractAddress: string;
        amount: string;
        protocolId: string;
        assetSymbol: string;
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
    }[] | undefined;
    errorCode?: string | undefined;
    errorMessage?: string | undefined;
}>;
export type ChainWalletResult = z.infer<typeof ChainWalletResultSchema>;
export declare const WalletSnapshotSchema: z.ZodObject<{
    walletAddress: z.ZodString;
    chains: z.ZodArray<z.ZodObject<{
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        chainName: z.ZodString;
        status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "ERROR"]>;
        blockNumber: z.ZodOptional<z.ZodString>;
        nativeBalance: z.ZodOptional<z.ZodString>;
        assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            symbol: z.ZodString;
            address: z.ZodString;
            amount: z.ZodString;
            amountBaseUnits: z.ZodString;
            decimals: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            symbol: string;
            address: string;
            amount: string;
            amountBaseUnits: string;
            decimals: number;
        }, {
            symbol: string;
            address: string;
            amount: string;
            amountBaseUnits: string;
            decimals: number;
        }>, "many">>;
        positions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            protocolId: z.ZodString;
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            assetSymbol: z.ZodString;
            amount: z.ZodString;
            contractAddress: z.ZodString;
            provenance: z.ZodObject<{
                chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
                blockNumber: z.ZodString;
                timestamp: z.ZodString;
                sourceId: z.ZodString;
                adapterVersion: z.ZodString;
                contractAddress: z.ZodOptional<z.ZodString>;
                dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
                confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
            }, "strict", z.ZodTypeAny, {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            }, {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            }>;
        }, "strict", z.ZodTypeAny, {
            chainId: 11155111 | 84532 | 80002;
            contractAddress: string;
            amount: string;
            protocolId: string;
            assetSymbol: string;
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
        }, {
            chainId: 11155111 | 84532 | 80002;
            contractAddress: string;
            amount: string;
            protocolId: string;
            assetSymbol: string;
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
        }>, "many">>;
        observedTimestamp: z.ZodString;
        provenance: z.ZodOptional<z.ZodObject<{
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            blockNumber: z.ZodString;
            timestamp: z.ZodString;
            sourceId: z.ZodString;
            adapterVersion: z.ZodString;
            contractAddress: z.ZodOptional<z.ZodString>;
            dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
            confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        }, "strict", z.ZodTypeAny, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }>>;
        errorCode: z.ZodOptional<z.ZodString>;
        errorMessage: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
        chainId: 11155111 | 84532 | 80002;
        chainName: string;
        assets: {
            symbol: string;
            address: string;
            amount: string;
            amountBaseUnits: string;
            decimals: number;
        }[];
        positions: {
            chainId: 11155111 | 84532 | 80002;
            contractAddress: string;
            amount: string;
            protocolId: string;
            assetSymbol: string;
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
        }[];
        observedTimestamp: string;
        blockNumber?: string | undefined;
        provenance?: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        } | undefined;
        nativeBalance?: string | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
    }, {
        status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
        chainId: 11155111 | 84532 | 80002;
        chainName: string;
        observedTimestamp: string;
        blockNumber?: string | undefined;
        provenance?: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        } | undefined;
        nativeBalance?: string | undefined;
        assets?: {
            symbol: string;
            address: string;
            amount: string;
            amountBaseUnits: string;
            decimals: number;
        }[] | undefined;
        positions?: {
            chainId: 11155111 | 84532 | 80002;
            contractAddress: string;
            amount: string;
            protocolId: string;
            assetSymbol: string;
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
        }[] | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
    }>, "many">;
    observedTimestamp: z.ZodString;
    snapshotHash: z.ZodString;
}, "strict", z.ZodTypeAny, {
    observedTimestamp: string;
    walletAddress: string;
    chains: {
        status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
        chainId: 11155111 | 84532 | 80002;
        chainName: string;
        assets: {
            symbol: string;
            address: string;
            amount: string;
            amountBaseUnits: string;
            decimals: number;
        }[];
        positions: {
            chainId: 11155111 | 84532 | 80002;
            contractAddress: string;
            amount: string;
            protocolId: string;
            assetSymbol: string;
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
        }[];
        observedTimestamp: string;
        blockNumber?: string | undefined;
        provenance?: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        } | undefined;
        nativeBalance?: string | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
    }[];
    snapshotHash: string;
}, {
    observedTimestamp: string;
    walletAddress: string;
    chains: {
        status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
        chainId: 11155111 | 84532 | 80002;
        chainName: string;
        observedTimestamp: string;
        blockNumber?: string | undefined;
        provenance?: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        } | undefined;
        nativeBalance?: string | undefined;
        assets?: {
            symbol: string;
            address: string;
            amount: string;
            amountBaseUnits: string;
            decimals: number;
        }[] | undefined;
        positions?: {
            chainId: 11155111 | 84532 | 80002;
            contractAddress: string;
            amount: string;
            protocolId: string;
            assetSymbol: string;
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
        }[] | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
    }[];
    snapshotHash: string;
}>;
export type WalletSnapshot = z.infer<typeof WalletSnapshotSchema>;
export declare const OpportunitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    protocolId: z.ZodString;
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    assetSymbol: z.ZodLiteral<"USDC">;
    assetAddress: z.ZodOptional<z.ZodString>;
    apyBps: z.ZodNumber;
    liquidity: z.ZodString;
    contractAddress: z.ZodOptional<z.ZodString>;
    riskScore: z.ZodNumber;
    withdrawalKnown: z.ZodBoolean;
    rateLabel: z.ZodEnum<["OBSERVED_TESTNET", "CONTROLLED_SIMULATION", "BASELINE"]>;
    provenance: z.ZodObject<{
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        blockNumber: z.ZodString;
        timestamp: z.ZodString;
        sourceId: z.ZodString;
        adapterVersion: z.ZodString;
        contractAddress: z.ZodOptional<z.ZodString>;
        dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
        confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
    }, "strict", z.ZodTypeAny, {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    }, {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    }>;
    status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "UNAVAILABLE"]>;
    statusReason: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
    chainId: 11155111 | 84532 | 80002;
    name: string;
    protocolId: string;
    assetSymbol: "USDC";
    provenance: {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    };
    id: string;
    apyBps: number;
    liquidity: string;
    riskScore: number;
    withdrawalKnown: boolean;
    rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
    contractAddress?: string | undefined;
    assetAddress?: string | undefined;
    statusReason?: string | undefined;
}, {
    status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
    chainId: 11155111 | 84532 | 80002;
    name: string;
    protocolId: string;
    assetSymbol: "USDC";
    provenance: {
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        sourceId: string;
        adapterVersion: string;
        dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
        confidence: "HIGH" | "MEDIUM" | "LOW";
        contractAddress?: string | undefined;
    };
    id: string;
    apyBps: number;
    liquidity: string;
    riskScore: number;
    withdrawalKnown: boolean;
    rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
    contractAddress?: string | undefined;
    assetAddress?: string | undefined;
    statusReason?: string | undefined;
}>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export declare const UserPolicySchema: z.ZodObject<{
    allowedChainIds: z.ZodArray<z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>, "many">;
    allowedProtocols: z.ZodArray<z.ZodString, "many">;
    assetSymbol: z.ZodLiteral<"USDC">;
    keepLiquidMinPct: z.ZodNumber;
    maxProtocolPct: z.ZodNumber;
    requireManualApproval: z.ZodLiteral<true>;
    maxDataAgeSeconds: z.ZodNumber;
    improvementThresholdBps: z.ZodNumber;
    maxRiskScore: z.ZodNumber;
    maxSlippageBps: z.ZodNumber;
    horizonDays: z.ZodNumber;
    planTtlSeconds: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    assetSymbol: "USDC";
    allowedChainIds: (11155111 | 84532 | 80002)[];
    allowedProtocols: string[];
    keepLiquidMinPct: number;
    maxProtocolPct: number;
    requireManualApproval: true;
    maxDataAgeSeconds: number;
    improvementThresholdBps: number;
    maxRiskScore: number;
    maxSlippageBps: number;
    horizonDays: number;
    planTtlSeconds: number;
}, {
    assetSymbol: "USDC";
    allowedChainIds: (11155111 | 84532 | 80002)[];
    allowedProtocols: string[];
    keepLiquidMinPct: number;
    maxProtocolPct: number;
    requireManualApproval: true;
    maxDataAgeSeconds: number;
    improvementThresholdBps: number;
    maxRiskScore: number;
    maxSlippageBps: number;
    horizonDays: number;
    planTtlSeconds: number;
}>;
export type UserPolicy = z.infer<typeof UserPolicySchema>;
export declare const DEFAULT_USER_POLICY: UserPolicy;
export declare const RejectionCodeSchema: z.ZodEnum<["CHAIN_NOT_ALLOWED", "PROTOCOL_NOT_ALLOWED", "ASSET_NOT_ALLOWED", "CONTRACT_NOT_ALLOWLISTED", "DATA_STALE", "PROVENANCE_MISSING", "RISK_LIMIT_EXCEEDED", "LIQUIDITY_INSUFFICIENT", "CONCENTRATION_LIMIT_EXCEEDED", "NO_MEANINGFUL_IMPROVEMENT", "ADAPTER_UNAVAILABLE", "INSUFFICIENT_BALANCE", "WITHDRAWAL_PATH_UNKNOWN"]>;
export type RejectionCode = z.infer<typeof RejectionCodeSchema>;
export declare const RejectionResultSchema: z.ZodObject<{
    opportunityId: z.ZodString;
    code: z.ZodEnum<["CHAIN_NOT_ALLOWED", "PROTOCOL_NOT_ALLOWED", "ASSET_NOT_ALLOWED", "CONTRACT_NOT_ALLOWLISTED", "DATA_STALE", "PROVENANCE_MISSING", "RISK_LIMIT_EXCEEDED", "LIQUIDITY_INSUFFICIENT", "CONCENTRATION_LIMIT_EXCEEDED", "NO_MEANINGFUL_IMPROVEMENT", "ADAPTER_UNAVAILABLE", "INSUFFICIENT_BALANCE", "WITHDRAWAL_PATH_UNKNOWN"]>;
    reason: z.ZodString;
}, "strict", z.ZodTypeAny, {
    code: "CHAIN_NOT_ALLOWED" | "PROTOCOL_NOT_ALLOWED" | "ASSET_NOT_ALLOWED" | "CONTRACT_NOT_ALLOWLISTED" | "DATA_STALE" | "PROVENANCE_MISSING" | "RISK_LIMIT_EXCEEDED" | "LIQUIDITY_INSUFFICIENT" | "CONCENTRATION_LIMIT_EXCEEDED" | "NO_MEANINGFUL_IMPROVEMENT" | "ADAPTER_UNAVAILABLE" | "INSUFFICIENT_BALANCE" | "WITHDRAWAL_PATH_UNKNOWN";
    opportunityId: string;
    reason: string;
}, {
    code: "CHAIN_NOT_ALLOWED" | "PROTOCOL_NOT_ALLOWED" | "ASSET_NOT_ALLOWED" | "CONTRACT_NOT_ALLOWLISTED" | "DATA_STALE" | "PROVENANCE_MISSING" | "RISK_LIMIT_EXCEEDED" | "LIQUIDITY_INSUFFICIENT" | "CONCENTRATION_LIMIT_EXCEEDED" | "NO_MEANINGFUL_IMPROVEMENT" | "ADAPTER_UNAVAILABLE" | "INSUFFICIENT_BALANCE" | "WITHDRAWAL_PATH_UNKNOWN";
    opportunityId: string;
    reason: string;
}>;
export type RejectionResult = z.infer<typeof RejectionResultSchema>;
export declare const ScoreBreakdownSchema: z.ZodObject<{
    netScore: z.ZodNumber;
    yieldBenefit: z.ZodNumber;
    gasPenalty: z.ZodNumber;
    protocolRiskPenalty: z.ZodNumber;
    liquidityPenalty: z.ZodNumber;
    concentrationPenalty: z.ZodNumber;
    uncertaintyPenalty: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    netScore: number;
    yieldBenefit: number;
    gasPenalty: number;
    protocolRiskPenalty: number;
    liquidityPenalty: number;
    concentrationPenalty: number;
    uncertaintyPenalty: number;
}, {
    netScore: number;
    yieldBenefit: number;
    gasPenalty: number;
    protocolRiskPenalty: number;
    liquidityPenalty: number;
    concentrationPenalty: number;
    uncertaintyPenalty: number;
}>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export declare const EligibleCandidateSchema: z.ZodObject<{
    opportunity: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        protocolId: z.ZodString;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        assetSymbol: z.ZodLiteral<"USDC">;
        assetAddress: z.ZodOptional<z.ZodString>;
        apyBps: z.ZodNumber;
        liquidity: z.ZodString;
        contractAddress: z.ZodOptional<z.ZodString>;
        riskScore: z.ZodNumber;
        withdrawalKnown: z.ZodBoolean;
        rateLabel: z.ZodEnum<["OBSERVED_TESTNET", "CONTROLLED_SIMULATION", "BASELINE"]>;
        provenance: z.ZodObject<{
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            blockNumber: z.ZodString;
            timestamp: z.ZodString;
            sourceId: z.ZodString;
            adapterVersion: z.ZodString;
            contractAddress: z.ZodOptional<z.ZodString>;
            dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
            confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        }, "strict", z.ZodTypeAny, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }>;
        status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "UNAVAILABLE"]>;
        statusReason: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }, {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }>;
    score: z.ZodObject<{
        netScore: z.ZodNumber;
        yieldBenefit: z.ZodNumber;
        gasPenalty: z.ZodNumber;
        protocolRiskPenalty: z.ZodNumber;
        liquidityPenalty: z.ZodNumber;
        concentrationPenalty: z.ZodNumber;
        uncertaintyPenalty: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    }, {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    }>;
}, "strict", z.ZodTypeAny, {
    opportunity: {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    };
    score: {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    };
}, {
    opportunity: {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    };
    score: {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    };
}>;
export declare const PlanStepSchema: z.ZodObject<{
    order: z.ZodNumber;
    kind: z.ZodEnum<["APPROVE", "SUPPLY", "DEPOSIT", "DO_NOTHING"]>;
    protocolId: z.ZodString;
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    tokenAddress: z.ZodOptional<z.ZodString>;
    targetAddress: z.ZodOptional<z.ZodString>;
    amountBaseUnits: z.ZodString;
    description: z.ZodString;
}, "strict", z.ZodTypeAny, {
    chainId: 11155111 | 84532 | 80002;
    amountBaseUnits: string;
    protocolId: string;
    order: number;
    kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
    description: string;
    tokenAddress?: string | undefined;
    targetAddress?: string | undefined;
}, {
    chainId: 11155111 | 84532 | 80002;
    amountBaseUnits: string;
    protocolId: string;
    order: number;
    kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
    description: string;
    tokenAddress?: string | undefined;
    targetAddress?: string | undefined;
}>;
export declare const ActionPlanSchema: z.ZodObject<{
    planId: z.ZodString;
    walletAddress: z.ZodString;
    selectedOpportunityId: z.ZodString;
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    protocolId: z.ZodString;
    assetSymbol: z.ZodLiteral<"USDC">;
    assetAddress: z.ZodOptional<z.ZodString>;
    requestedAmount: z.ZodString;
    deployAmount: z.ZodString;
    deployAmountBaseUnits: z.ZodString;
    liquidReserveAmount: z.ZodString;
    targetContract: z.ZodOptional<z.ZodString>;
    actionType: z.ZodEnum<["SUPPLY", "DEPOSIT", "DO_NOTHING"]>;
    steps: z.ZodArray<z.ZodObject<{
        order: z.ZodNumber;
        kind: z.ZodEnum<["APPROVE", "SUPPLY", "DEPOSIT", "DO_NOTHING"]>;
        protocolId: z.ZodString;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        tokenAddress: z.ZodOptional<z.ZodString>;
        targetAddress: z.ZodOptional<z.ZodString>;
        amountBaseUnits: z.ZodString;
        description: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        chainId: 11155111 | 84532 | 80002;
        amountBaseUnits: string;
        protocolId: string;
        order: number;
        kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        description: string;
        tokenAddress?: string | undefined;
        targetAddress?: string | undefined;
    }, {
        chainId: 11155111 | 84532 | 80002;
        amountBaseUnits: string;
        protocolId: string;
        order: number;
        kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        description: string;
        tokenAddress?: string | undefined;
        targetAddress?: string | undefined;
    }>, "many">;
    policyHash: z.ZodString;
    snapshotHash: z.ZodString;
    opportunitySetHash: z.ZodString;
    nonce: z.ZodString;
    createdAt: z.ZodString;
    deadline: z.ZodString;
    planHash: z.ZodString;
}, "strict", z.ZodTypeAny, {
    chainId: 11155111 | 84532 | 80002;
    protocolId: string;
    assetSymbol: "USDC";
    walletAddress: string;
    snapshotHash: string;
    planId: string;
    selectedOpportunityId: string;
    requestedAmount: string;
    deployAmount: string;
    deployAmountBaseUnits: string;
    liquidReserveAmount: string;
    actionType: "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
    steps: {
        chainId: 11155111 | 84532 | 80002;
        amountBaseUnits: string;
        protocolId: string;
        order: number;
        kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        description: string;
        tokenAddress?: string | undefined;
        targetAddress?: string | undefined;
    }[];
    policyHash: string;
    opportunitySetHash: string;
    nonce: string;
    createdAt: string;
    deadline: string;
    planHash: string;
    assetAddress?: string | undefined;
    targetContract?: string | undefined;
}, {
    chainId: 11155111 | 84532 | 80002;
    protocolId: string;
    assetSymbol: "USDC";
    walletAddress: string;
    snapshotHash: string;
    planId: string;
    selectedOpportunityId: string;
    requestedAmount: string;
    deployAmount: string;
    deployAmountBaseUnits: string;
    liquidReserveAmount: string;
    actionType: "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
    steps: {
        chainId: 11155111 | 84532 | 80002;
        amountBaseUnits: string;
        protocolId: string;
        order: number;
        kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        description: string;
        tokenAddress?: string | undefined;
        targetAddress?: string | undefined;
    }[];
    policyHash: string;
    opportunitySetHash: string;
    nonce: string;
    createdAt: string;
    deadline: string;
    planHash: string;
    assetAddress?: string | undefined;
    targetContract?: string | undefined;
}>;
export type ActionPlan = z.infer<typeof ActionPlanSchema>;
export declare const TransactionRequestSchema: z.ZodObject<{
    kind: z.ZodEnum<["APPROVAL", "ACTION"]>;
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    from: z.ZodString;
    to: z.ZodString;
    data: z.ZodString;
    value: z.ZodString;
    gasLimit: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
}, "strict", z.ZodTypeAny, {
    value: string;
    chainId: 11155111 | 84532 | 80002;
    kind: "APPROVAL" | "ACTION";
    description: string;
    from: string;
    to: string;
    data: string;
    gasLimit?: string | undefined;
}, {
    value: string;
    chainId: 11155111 | 84532 | 80002;
    kind: "APPROVAL" | "ACTION";
    description: string;
    from: string;
    to: string;
    data: string;
    gasLimit?: string | undefined;
}>;
export type TransactionRequest = z.infer<typeof TransactionRequestSchema>;
export declare const SimulationResultSchema: z.ZodObject<{
    planId: z.ZodString;
    planHash: z.ZodString;
    status: z.ZodEnum<["PASSED", "APPROVAL_REQUIRED", "FAILED", "NO_ACTION"]>;
    success: z.ZodBoolean;
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    blockNumber: z.ZodString;
    preConditions: z.ZodObject<{
        balanceBaseUnits: z.ZodString;
        allowanceBaseUnits: z.ZodString;
        targetHasCode: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        balanceBaseUnits: string;
        allowanceBaseUnits: string;
        targetHasCode: boolean;
    }, {
        balanceBaseUnits: string;
        allowanceBaseUnits: string;
        targetHasCode: boolean;
    }>;
    postConditions: z.ZodObject<{
        minimumWalletBalanceBaseUnits: z.ZodString;
        expectedPositionIncreaseBaseUnits: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        minimumWalletBalanceBaseUnits: string;
        expectedPositionIncreaseBaseUnits: string;
    }, {
        minimumWalletBalanceBaseUnits: string;
        expectedPositionIncreaseBaseUnits: string;
    }>;
    nextTransaction: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<["APPROVAL", "ACTION"]>;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        from: z.ZodString;
        to: z.ZodString;
        data: z.ZodString;
        value: z.ZodString;
        gasLimit: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        from: string;
        to: string;
        data: string;
        gasLimit?: string | undefined;
    }, {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        from: string;
        to: string;
        data: string;
        gasLimit?: string | undefined;
    }>>;
    estimatedGas: z.ZodString;
    simulationHash: z.ZodString;
    timestamp: z.ZodString;
    expiresAt: z.ZodString;
    errorCode: z.ZodOptional<z.ZodString>;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    status: "PASSED" | "APPROVAL_REQUIRED" | "FAILED" | "NO_ACTION";
    chainId: 11155111 | 84532 | 80002;
    blockNumber: string;
    timestamp: string;
    planId: string;
    planHash: string;
    success: boolean;
    preConditions: {
        balanceBaseUnits: string;
        allowanceBaseUnits: string;
        targetHasCode: boolean;
    };
    postConditions: {
        minimumWalletBalanceBaseUnits: string;
        expectedPositionIncreaseBaseUnits: string;
    };
    estimatedGas: string;
    simulationHash: string;
    expiresAt: string;
    errorCode?: string | undefined;
    errorMessage?: string | undefined;
    nextTransaction?: {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        from: string;
        to: string;
        data: string;
        gasLimit?: string | undefined;
    } | undefined;
}, {
    status: "PASSED" | "APPROVAL_REQUIRED" | "FAILED" | "NO_ACTION";
    chainId: 11155111 | 84532 | 80002;
    blockNumber: string;
    timestamp: string;
    planId: string;
    planHash: string;
    success: boolean;
    preConditions: {
        balanceBaseUnits: string;
        allowanceBaseUnits: string;
        targetHasCode: boolean;
    };
    postConditions: {
        minimumWalletBalanceBaseUnits: string;
        expectedPositionIncreaseBaseUnits: string;
    };
    estimatedGas: string;
    simulationHash: string;
    expiresAt: string;
    errorCode?: string | undefined;
    errorMessage?: string | undefined;
    nextTransaction?: {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        from: string;
        to: string;
        data: string;
        gasLimit?: string | undefined;
    } | undefined;
}>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export declare const PreparedTransactionSchema: z.ZodObject<{
    kind: z.ZodEnum<["APPROVAL", "ACTION"]>;
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    from: z.ZodString;
    to: z.ZodString;
    data: z.ZodString;
    value: z.ZodString;
    gasLimit: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
} & {
    planId: z.ZodString;
    planHash: z.ZodString;
    simulationHash: z.ZodString;
    warning: z.ZodString;
    preparedAt: z.ZodString;
    expiresAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    value: string;
    chainId: 11155111 | 84532 | 80002;
    kind: "APPROVAL" | "ACTION";
    description: string;
    planId: string;
    planHash: string;
    from: string;
    to: string;
    data: string;
    simulationHash: string;
    expiresAt: string;
    warning: string;
    preparedAt: string;
    gasLimit?: string | undefined;
}, {
    value: string;
    chainId: 11155111 | 84532 | 80002;
    kind: "APPROVAL" | "ACTION";
    description: string;
    planId: string;
    planHash: string;
    from: string;
    to: string;
    data: string;
    simulationHash: string;
    expiresAt: string;
    warning: string;
    preparedAt: string;
    gasLimit?: string | undefined;
}>;
export type PreparedTransaction = z.infer<typeof PreparedTransactionSchema>;
export declare const ExecutionVerificationSchema: z.ZodObject<{
    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
    transactionHash: z.ZodString;
    planHash: z.ZodString;
    kind: z.ZodEnum<["APPROVAL", "ACTION"]>;
    status: z.ZodEnum<["SUCCESS", "FAILED", "PENDING", "UNVERIFIED"]>;
    blockNumber: z.ZodOptional<z.ZodString>;
    gasUsed: z.ZodOptional<z.ZodString>;
    confirmations: z.ZodNumber;
    postConditionsPassed: z.ZodBoolean;
    postConditions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        passed: z.ZodBoolean;
        expected: z.ZodString;
        actual: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        expected: string;
        name: string;
        passed: boolean;
        actual: string;
    }, {
        expected: string;
        name: string;
        passed: boolean;
        actual: string;
    }>, "many">;
    observedTimestamp: z.ZodString;
    errorCode: z.ZodOptional<z.ZodString>;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    status: "FAILED" | "SUCCESS" | "PENDING" | "UNVERIFIED";
    chainId: 11155111 | 84532 | 80002;
    observedTimestamp: string;
    kind: "APPROVAL" | "ACTION";
    planHash: string;
    postConditions: {
        expected: string;
        name: string;
        passed: boolean;
        actual: string;
    }[];
    transactionHash: string;
    confirmations: number;
    postConditionsPassed: boolean;
    blockNumber?: string | undefined;
    errorCode?: string | undefined;
    errorMessage?: string | undefined;
    gasUsed?: string | undefined;
}, {
    status: "FAILED" | "SUCCESS" | "PENDING" | "UNVERIFIED";
    chainId: 11155111 | 84532 | 80002;
    observedTimestamp: string;
    kind: "APPROVAL" | "ACTION";
    planHash: string;
    postConditions: {
        expected: string;
        name: string;
        passed: boolean;
        actual: string;
    }[];
    transactionHash: string;
    confirmations: number;
    postConditionsPassed: boolean;
    blockNumber?: string | undefined;
    errorCode?: string | undefined;
    errorMessage?: string | undefined;
    gasUsed?: string | undefined;
}>;
export type ExecutionVerification = z.infer<typeof ExecutionVerificationSchema>;
export declare const DecisionReceiptSchema: z.ZodObject<{
    receiptVersion: z.ZodLiteral<"1.0.0">;
    receiptId: z.ZodString;
    stage: z.ZodEnum<["PLANNED", "APPROVAL_REQUIRED", "SIMULATED", "PREPARED", "APPROVAL_VERIFIED", "EXECUTED", "FAILED"]>;
    walletAddress: z.ZodString;
    intent: z.ZodObject<{
        assetSymbol: z.ZodLiteral<"USDC">;
        requestedAmount: z.ZodString;
        horizonDays: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        assetSymbol: "USDC";
        horizonDays: number;
        requestedAmount: string;
    }, {
        assetSymbol: "USDC";
        horizonDays: number;
        requestedAmount: string;
    }>;
    policy: z.ZodObject<{
        allowedChainIds: z.ZodArray<z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>, "many">;
        allowedProtocols: z.ZodArray<z.ZodString, "many">;
        assetSymbol: z.ZodLiteral<"USDC">;
        keepLiquidMinPct: z.ZodNumber;
        maxProtocolPct: z.ZodNumber;
        requireManualApproval: z.ZodLiteral<true>;
        maxDataAgeSeconds: z.ZodNumber;
        improvementThresholdBps: z.ZodNumber;
        maxRiskScore: z.ZodNumber;
        maxSlippageBps: z.ZodNumber;
        horizonDays: z.ZodNumber;
        planTtlSeconds: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        assetSymbol: "USDC";
        allowedChainIds: (11155111 | 84532 | 80002)[];
        allowedProtocols: string[];
        keepLiquidMinPct: number;
        maxProtocolPct: number;
        requireManualApproval: true;
        maxDataAgeSeconds: number;
        improvementThresholdBps: number;
        maxRiskScore: number;
        maxSlippageBps: number;
        horizonDays: number;
        planTtlSeconds: number;
    }, {
        assetSymbol: "USDC";
        allowedChainIds: (11155111 | 84532 | 80002)[];
        allowedProtocols: string[];
        keepLiquidMinPct: number;
        maxProtocolPct: number;
        requireManualApproval: true;
        maxDataAgeSeconds: number;
        improvementThresholdBps: number;
        maxRiskScore: number;
        maxSlippageBps: number;
        horizonDays: number;
        planTtlSeconds: number;
    }>;
    policyHash: z.ZodString;
    snapshot: z.ZodObject<{
        walletAddress: z.ZodString;
        chains: z.ZodArray<z.ZodObject<{
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            chainName: z.ZodString;
            status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "ERROR"]>;
            blockNumber: z.ZodOptional<z.ZodString>;
            nativeBalance: z.ZodOptional<z.ZodString>;
            assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
                symbol: z.ZodString;
                address: z.ZodString;
                amount: z.ZodString;
                amountBaseUnits: z.ZodString;
                decimals: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }, {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }>, "many">>;
            positions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                protocolId: z.ZodString;
                chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
                assetSymbol: z.ZodString;
                amount: z.ZodString;
                contractAddress: z.ZodString;
                provenance: z.ZodObject<{
                    chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
                    blockNumber: z.ZodString;
                    timestamp: z.ZodString;
                    sourceId: z.ZodString;
                    adapterVersion: z.ZodString;
                    contractAddress: z.ZodOptional<z.ZodString>;
                    dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
                    confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
                }, "strict", z.ZodTypeAny, {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                }, {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                }>;
            }, "strict", z.ZodTypeAny, {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }, {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }>, "many">>;
            observedTimestamp: z.ZodString;
            provenance: z.ZodOptional<z.ZodObject<{
                chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
                blockNumber: z.ZodString;
                timestamp: z.ZodString;
                sourceId: z.ZodString;
                adapterVersion: z.ZodString;
                contractAddress: z.ZodOptional<z.ZodString>;
                dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
                confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
            }, "strict", z.ZodTypeAny, {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            }, {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            }>>;
            errorCode: z.ZodOptional<z.ZodString>;
            errorMessage: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
            chainId: 11155111 | 84532 | 80002;
            chainName: string;
            assets: {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }[];
            positions: {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }[];
            observedTimestamp: string;
            blockNumber?: string | undefined;
            provenance?: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            } | undefined;
            nativeBalance?: string | undefined;
            errorCode?: string | undefined;
            errorMessage?: string | undefined;
        }, {
            status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
            chainId: 11155111 | 84532 | 80002;
            chainName: string;
            observedTimestamp: string;
            blockNumber?: string | undefined;
            provenance?: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            } | undefined;
            nativeBalance?: string | undefined;
            assets?: {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }[] | undefined;
            positions?: {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }[] | undefined;
            errorCode?: string | undefined;
            errorMessage?: string | undefined;
        }>, "many">;
        observedTimestamp: z.ZodString;
        snapshotHash: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        observedTimestamp: string;
        walletAddress: string;
        chains: {
            status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
            chainId: 11155111 | 84532 | 80002;
            chainName: string;
            assets: {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }[];
            positions: {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }[];
            observedTimestamp: string;
            blockNumber?: string | undefined;
            provenance?: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            } | undefined;
            nativeBalance?: string | undefined;
            errorCode?: string | undefined;
            errorMessage?: string | undefined;
        }[];
        snapshotHash: string;
    }, {
        observedTimestamp: string;
        walletAddress: string;
        chains: {
            status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
            chainId: 11155111 | 84532 | 80002;
            chainName: string;
            observedTimestamp: string;
            blockNumber?: string | undefined;
            provenance?: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            } | undefined;
            nativeBalance?: string | undefined;
            assets?: {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }[] | undefined;
            positions?: {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }[] | undefined;
            errorCode?: string | undefined;
            errorMessage?: string | undefined;
        }[];
        snapshotHash: string;
    }>;
    opportunities: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        protocolId: z.ZodString;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        assetSymbol: z.ZodLiteral<"USDC">;
        assetAddress: z.ZodOptional<z.ZodString>;
        apyBps: z.ZodNumber;
        liquidity: z.ZodString;
        contractAddress: z.ZodOptional<z.ZodString>;
        riskScore: z.ZodNumber;
        withdrawalKnown: z.ZodBoolean;
        rateLabel: z.ZodEnum<["OBSERVED_TESTNET", "CONTROLLED_SIMULATION", "BASELINE"]>;
        provenance: z.ZodObject<{
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            blockNumber: z.ZodString;
            timestamp: z.ZodString;
            sourceId: z.ZodString;
            adapterVersion: z.ZodString;
            contractAddress: z.ZodOptional<z.ZodString>;
            dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
            confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        }, "strict", z.ZodTypeAny, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }>;
        status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "UNAVAILABLE"]>;
        statusReason: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }, {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }>, "many">;
    eligibleCandidates: z.ZodArray<z.ZodObject<{
        opportunity: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            protocolId: z.ZodString;
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            assetSymbol: z.ZodLiteral<"USDC">;
            assetAddress: z.ZodOptional<z.ZodString>;
            apyBps: z.ZodNumber;
            liquidity: z.ZodString;
            contractAddress: z.ZodOptional<z.ZodString>;
            riskScore: z.ZodNumber;
            withdrawalKnown: z.ZodBoolean;
            rateLabel: z.ZodEnum<["OBSERVED_TESTNET", "CONTROLLED_SIMULATION", "BASELINE"]>;
            provenance: z.ZodObject<{
                chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
                blockNumber: z.ZodString;
                timestamp: z.ZodString;
                sourceId: z.ZodString;
                adapterVersion: z.ZodString;
                contractAddress: z.ZodOptional<z.ZodString>;
                dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
                confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
            }, "strict", z.ZodTypeAny, {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            }, {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            }>;
            status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "UNAVAILABLE"]>;
            statusReason: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
            chainId: 11155111 | 84532 | 80002;
            name: string;
            protocolId: string;
            assetSymbol: "USDC";
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
            id: string;
            apyBps: number;
            liquidity: string;
            riskScore: number;
            withdrawalKnown: boolean;
            rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
            contractAddress?: string | undefined;
            assetAddress?: string | undefined;
            statusReason?: string | undefined;
        }, {
            status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
            chainId: 11155111 | 84532 | 80002;
            name: string;
            protocolId: string;
            assetSymbol: "USDC";
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
            id: string;
            apyBps: number;
            liquidity: string;
            riskScore: number;
            withdrawalKnown: boolean;
            rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
            contractAddress?: string | undefined;
            assetAddress?: string | undefined;
            statusReason?: string | undefined;
        }>;
        score: z.ZodObject<{
            netScore: z.ZodNumber;
            yieldBenefit: z.ZodNumber;
            gasPenalty: z.ZodNumber;
            protocolRiskPenalty: z.ZodNumber;
            liquidityPenalty: z.ZodNumber;
            concentrationPenalty: z.ZodNumber;
            uncertaintyPenalty: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            netScore: number;
            yieldBenefit: number;
            gasPenalty: number;
            protocolRiskPenalty: number;
            liquidityPenalty: number;
            concentrationPenalty: number;
            uncertaintyPenalty: number;
        }, {
            netScore: number;
            yieldBenefit: number;
            gasPenalty: number;
            protocolRiskPenalty: number;
            liquidityPenalty: number;
            concentrationPenalty: number;
            uncertaintyPenalty: number;
        }>;
    }, "strict", z.ZodTypeAny, {
        opportunity: {
            status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
            chainId: 11155111 | 84532 | 80002;
            name: string;
            protocolId: string;
            assetSymbol: "USDC";
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
            id: string;
            apyBps: number;
            liquidity: string;
            riskScore: number;
            withdrawalKnown: boolean;
            rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
            contractAddress?: string | undefined;
            assetAddress?: string | undefined;
            statusReason?: string | undefined;
        };
        score: {
            netScore: number;
            yieldBenefit: number;
            gasPenalty: number;
            protocolRiskPenalty: number;
            liquidityPenalty: number;
            concentrationPenalty: number;
            uncertaintyPenalty: number;
        };
    }, {
        opportunity: {
            status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
            chainId: 11155111 | 84532 | 80002;
            name: string;
            protocolId: string;
            assetSymbol: "USDC";
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
            id: string;
            apyBps: number;
            liquidity: string;
            riskScore: number;
            withdrawalKnown: boolean;
            rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
            contractAddress?: string | undefined;
            assetAddress?: string | undefined;
            statusReason?: string | undefined;
        };
        score: {
            netScore: number;
            yieldBenefit: number;
            gasPenalty: number;
            protocolRiskPenalty: number;
            liquidityPenalty: number;
            concentrationPenalty: number;
            uncertaintyPenalty: number;
        };
    }>, "many">;
    selectedOpportunity: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        protocolId: z.ZodString;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        assetSymbol: z.ZodLiteral<"USDC">;
        assetAddress: z.ZodOptional<z.ZodString>;
        apyBps: z.ZodNumber;
        liquidity: z.ZodString;
        contractAddress: z.ZodOptional<z.ZodString>;
        riskScore: z.ZodNumber;
        withdrawalKnown: z.ZodBoolean;
        rateLabel: z.ZodEnum<["OBSERVED_TESTNET", "CONTROLLED_SIMULATION", "BASELINE"]>;
        provenance: z.ZodObject<{
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            blockNumber: z.ZodString;
            timestamp: z.ZodString;
            sourceId: z.ZodString;
            adapterVersion: z.ZodString;
            contractAddress: z.ZodOptional<z.ZodString>;
            dataMode: z.ZodEnum<["LIVE", "SIMULATED", "SYSTEM"]>;
            confidence: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        }, "strict", z.ZodTypeAny, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }, {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        }>;
        status: z.ZodEnum<["LIVE", "NOT_CONFIGURED", "UNAVAILABLE"]>;
        statusReason: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }, {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }>;
    scoreBreakdown: z.ZodObject<{
        netScore: z.ZodNumber;
        yieldBenefit: z.ZodNumber;
        gasPenalty: z.ZodNumber;
        protocolRiskPenalty: z.ZodNumber;
        liquidityPenalty: z.ZodNumber;
        concentrationPenalty: z.ZodNumber;
        uncertaintyPenalty: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    }, {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    }>;
    rejectedCandidates: z.ZodArray<z.ZodObject<{
        opportunityId: z.ZodString;
        code: z.ZodEnum<["CHAIN_NOT_ALLOWED", "PROTOCOL_NOT_ALLOWED", "ASSET_NOT_ALLOWED", "CONTRACT_NOT_ALLOWLISTED", "DATA_STALE", "PROVENANCE_MISSING", "RISK_LIMIT_EXCEEDED", "LIQUIDITY_INSUFFICIENT", "CONCENTRATION_LIMIT_EXCEEDED", "NO_MEANINGFUL_IMPROVEMENT", "ADAPTER_UNAVAILABLE", "INSUFFICIENT_BALANCE", "WITHDRAWAL_PATH_UNKNOWN"]>;
        reason: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        code: "CHAIN_NOT_ALLOWED" | "PROTOCOL_NOT_ALLOWED" | "ASSET_NOT_ALLOWED" | "CONTRACT_NOT_ALLOWLISTED" | "DATA_STALE" | "PROVENANCE_MISSING" | "RISK_LIMIT_EXCEEDED" | "LIQUIDITY_INSUFFICIENT" | "CONCENTRATION_LIMIT_EXCEEDED" | "NO_MEANINGFUL_IMPROVEMENT" | "ADAPTER_UNAVAILABLE" | "INSUFFICIENT_BALANCE" | "WITHDRAWAL_PATH_UNKNOWN";
        opportunityId: string;
        reason: string;
    }, {
        code: "CHAIN_NOT_ALLOWED" | "PROTOCOL_NOT_ALLOWED" | "ASSET_NOT_ALLOWED" | "CONTRACT_NOT_ALLOWLISTED" | "DATA_STALE" | "PROVENANCE_MISSING" | "RISK_LIMIT_EXCEEDED" | "LIQUIDITY_INSUFFICIENT" | "CONCENTRATION_LIMIT_EXCEEDED" | "NO_MEANINGFUL_IMPROVEMENT" | "ADAPTER_UNAVAILABLE" | "INSUFFICIENT_BALANCE" | "WITHDRAWAL_PATH_UNKNOWN";
        opportunityId: string;
        reason: string;
    }>, "many">;
    plan: z.ZodObject<{
        planId: z.ZodString;
        walletAddress: z.ZodString;
        selectedOpportunityId: z.ZodString;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        protocolId: z.ZodString;
        assetSymbol: z.ZodLiteral<"USDC">;
        assetAddress: z.ZodOptional<z.ZodString>;
        requestedAmount: z.ZodString;
        deployAmount: z.ZodString;
        deployAmountBaseUnits: z.ZodString;
        liquidReserveAmount: z.ZodString;
        targetContract: z.ZodOptional<z.ZodString>;
        actionType: z.ZodEnum<["SUPPLY", "DEPOSIT", "DO_NOTHING"]>;
        steps: z.ZodArray<z.ZodObject<{
            order: z.ZodNumber;
            kind: z.ZodEnum<["APPROVE", "SUPPLY", "DEPOSIT", "DO_NOTHING"]>;
            protocolId: z.ZodString;
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            tokenAddress: z.ZodOptional<z.ZodString>;
            targetAddress: z.ZodOptional<z.ZodString>;
            amountBaseUnits: z.ZodString;
            description: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            chainId: 11155111 | 84532 | 80002;
            amountBaseUnits: string;
            protocolId: string;
            order: number;
            kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
            description: string;
            tokenAddress?: string | undefined;
            targetAddress?: string | undefined;
        }, {
            chainId: 11155111 | 84532 | 80002;
            amountBaseUnits: string;
            protocolId: string;
            order: number;
            kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
            description: string;
            tokenAddress?: string | undefined;
            targetAddress?: string | undefined;
        }>, "many">;
        policyHash: z.ZodString;
        snapshotHash: z.ZodString;
        opportunitySetHash: z.ZodString;
        nonce: z.ZodString;
        createdAt: z.ZodString;
        deadline: z.ZodString;
        planHash: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        chainId: 11155111 | 84532 | 80002;
        protocolId: string;
        assetSymbol: "USDC";
        walletAddress: string;
        snapshotHash: string;
        planId: string;
        selectedOpportunityId: string;
        requestedAmount: string;
        deployAmount: string;
        deployAmountBaseUnits: string;
        liquidReserveAmount: string;
        actionType: "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        steps: {
            chainId: 11155111 | 84532 | 80002;
            amountBaseUnits: string;
            protocolId: string;
            order: number;
            kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
            description: string;
            tokenAddress?: string | undefined;
            targetAddress?: string | undefined;
        }[];
        policyHash: string;
        opportunitySetHash: string;
        nonce: string;
        createdAt: string;
        deadline: string;
        planHash: string;
        assetAddress?: string | undefined;
        targetContract?: string | undefined;
    }, {
        chainId: 11155111 | 84532 | 80002;
        protocolId: string;
        assetSymbol: "USDC";
        walletAddress: string;
        snapshotHash: string;
        planId: string;
        selectedOpportunityId: string;
        requestedAmount: string;
        deployAmount: string;
        deployAmountBaseUnits: string;
        liquidReserveAmount: string;
        actionType: "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        steps: {
            chainId: 11155111 | 84532 | 80002;
            amountBaseUnits: string;
            protocolId: string;
            order: number;
            kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
            description: string;
            tokenAddress?: string | undefined;
            targetAddress?: string | undefined;
        }[];
        policyHash: string;
        opportunitySetHash: string;
        nonce: string;
        createdAt: string;
        deadline: string;
        planHash: string;
        assetAddress?: string | undefined;
        targetContract?: string | undefined;
    }>;
    simulation: z.ZodOptional<z.ZodObject<{
        planId: z.ZodString;
        planHash: z.ZodString;
        status: z.ZodEnum<["PASSED", "APPROVAL_REQUIRED", "FAILED", "NO_ACTION"]>;
        success: z.ZodBoolean;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        blockNumber: z.ZodString;
        preConditions: z.ZodObject<{
            balanceBaseUnits: z.ZodString;
            allowanceBaseUnits: z.ZodString;
            targetHasCode: z.ZodBoolean;
        }, "strict", z.ZodTypeAny, {
            balanceBaseUnits: string;
            allowanceBaseUnits: string;
            targetHasCode: boolean;
        }, {
            balanceBaseUnits: string;
            allowanceBaseUnits: string;
            targetHasCode: boolean;
        }>;
        postConditions: z.ZodObject<{
            minimumWalletBalanceBaseUnits: z.ZodString;
            expectedPositionIncreaseBaseUnits: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            minimumWalletBalanceBaseUnits: string;
            expectedPositionIncreaseBaseUnits: string;
        }, {
            minimumWalletBalanceBaseUnits: string;
            expectedPositionIncreaseBaseUnits: string;
        }>;
        nextTransaction: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<["APPROVAL", "ACTION"]>;
            chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
            from: z.ZodString;
            to: z.ZodString;
            data: z.ZodString;
            value: z.ZodString;
            gasLimit: z.ZodOptional<z.ZodString>;
            description: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            value: string;
            chainId: 11155111 | 84532 | 80002;
            kind: "APPROVAL" | "ACTION";
            description: string;
            from: string;
            to: string;
            data: string;
            gasLimit?: string | undefined;
        }, {
            value: string;
            chainId: 11155111 | 84532 | 80002;
            kind: "APPROVAL" | "ACTION";
            description: string;
            from: string;
            to: string;
            data: string;
            gasLimit?: string | undefined;
        }>>;
        estimatedGas: z.ZodString;
        simulationHash: z.ZodString;
        timestamp: z.ZodString;
        expiresAt: z.ZodString;
        errorCode: z.ZodOptional<z.ZodString>;
        errorMessage: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        status: "PASSED" | "APPROVAL_REQUIRED" | "FAILED" | "NO_ACTION";
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        planId: string;
        planHash: string;
        success: boolean;
        preConditions: {
            balanceBaseUnits: string;
            allowanceBaseUnits: string;
            targetHasCode: boolean;
        };
        postConditions: {
            minimumWalletBalanceBaseUnits: string;
            expectedPositionIncreaseBaseUnits: string;
        };
        estimatedGas: string;
        simulationHash: string;
        expiresAt: string;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        nextTransaction?: {
            value: string;
            chainId: 11155111 | 84532 | 80002;
            kind: "APPROVAL" | "ACTION";
            description: string;
            from: string;
            to: string;
            data: string;
            gasLimit?: string | undefined;
        } | undefined;
    }, {
        status: "PASSED" | "APPROVAL_REQUIRED" | "FAILED" | "NO_ACTION";
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        planId: string;
        planHash: string;
        success: boolean;
        preConditions: {
            balanceBaseUnits: string;
            allowanceBaseUnits: string;
            targetHasCode: boolean;
        };
        postConditions: {
            minimumWalletBalanceBaseUnits: string;
            expectedPositionIncreaseBaseUnits: string;
        };
        estimatedGas: string;
        simulationHash: string;
        expiresAt: string;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        nextTransaction?: {
            value: string;
            chainId: 11155111 | 84532 | 80002;
            kind: "APPROVAL" | "ACTION";
            description: string;
            from: string;
            to: string;
            data: string;
            gasLimit?: string | undefined;
        } | undefined;
    }>>;
    preparedTransaction: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<["APPROVAL", "ACTION"]>;
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        from: z.ZodString;
        to: z.ZodString;
        data: z.ZodString;
        value: z.ZodString;
        gasLimit: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
    } & {
        planId: z.ZodString;
        planHash: z.ZodString;
        simulationHash: z.ZodString;
        warning: z.ZodString;
        preparedAt: z.ZodString;
        expiresAt: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        planId: string;
        planHash: string;
        from: string;
        to: string;
        data: string;
        simulationHash: string;
        expiresAt: string;
        warning: string;
        preparedAt: string;
        gasLimit?: string | undefined;
    }, {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        planId: string;
        planHash: string;
        from: string;
        to: string;
        data: string;
        simulationHash: string;
        expiresAt: string;
        warning: string;
        preparedAt: string;
        gasLimit?: string | undefined;
    }>>;
    verifications: z.ZodArray<z.ZodObject<{
        chainId: z.ZodUnion<[z.ZodLiteral<11155111>, z.ZodLiteral<84532>, z.ZodLiteral<80002>]>;
        transactionHash: z.ZodString;
        planHash: z.ZodString;
        kind: z.ZodEnum<["APPROVAL", "ACTION"]>;
        status: z.ZodEnum<["SUCCESS", "FAILED", "PENDING", "UNVERIFIED"]>;
        blockNumber: z.ZodOptional<z.ZodString>;
        gasUsed: z.ZodOptional<z.ZodString>;
        confirmations: z.ZodNumber;
        postConditionsPassed: z.ZodBoolean;
        postConditions: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            passed: z.ZodBoolean;
            expected: z.ZodString;
            actual: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            expected: string;
            name: string;
            passed: boolean;
            actual: string;
        }, {
            expected: string;
            name: string;
            passed: boolean;
            actual: string;
        }>, "many">;
        observedTimestamp: z.ZodString;
        errorCode: z.ZodOptional<z.ZodString>;
        errorMessage: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        status: "FAILED" | "SUCCESS" | "PENDING" | "UNVERIFIED";
        chainId: 11155111 | 84532 | 80002;
        observedTimestamp: string;
        kind: "APPROVAL" | "ACTION";
        planHash: string;
        postConditions: {
            expected: string;
            name: string;
            passed: boolean;
            actual: string;
        }[];
        transactionHash: string;
        confirmations: number;
        postConditionsPassed: boolean;
        blockNumber?: string | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        gasUsed?: string | undefined;
    }, {
        status: "FAILED" | "SUCCESS" | "PENDING" | "UNVERIFIED";
        chainId: 11155111 | 84532 | 80002;
        observedTimestamp: string;
        kind: "APPROVAL" | "ACTION";
        planHash: string;
        postConditions: {
            expected: string;
            name: string;
            passed: boolean;
            actual: string;
        }[];
        transactionHash: string;
        confirmations: number;
        postConditionsPassed: boolean;
        blockNumber?: string | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        gasUsed?: string | undefined;
    }>, "many">;
    approval: z.ZodOptional<z.ZodObject<{
        mode: z.ZodLiteral<"wallet_signature">;
        transactionHash: z.ZodString;
        approvedAt: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        transactionHash: string;
        mode: "wallet_signature";
        approvedAt: string;
    }, {
        transactionHash: string;
        mode: "wallet_signature";
        approvedAt: string;
    }>>;
    finalReceiptHash: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    walletAddress: string;
    policyHash: string;
    createdAt: string;
    receiptVersion: "1.0.0";
    receiptId: string;
    stage: "SIMULATED" | "APPROVAL_REQUIRED" | "FAILED" | "PLANNED" | "PREPARED" | "APPROVAL_VERIFIED" | "EXECUTED";
    intent: {
        assetSymbol: "USDC";
        horizonDays: number;
        requestedAmount: string;
    };
    policy: {
        assetSymbol: "USDC";
        allowedChainIds: (11155111 | 84532 | 80002)[];
        allowedProtocols: string[];
        keepLiquidMinPct: number;
        maxProtocolPct: number;
        requireManualApproval: true;
        maxDataAgeSeconds: number;
        improvementThresholdBps: number;
        maxRiskScore: number;
        maxSlippageBps: number;
        horizonDays: number;
        planTtlSeconds: number;
    };
    snapshot: {
        observedTimestamp: string;
        walletAddress: string;
        chains: {
            status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
            chainId: 11155111 | 84532 | 80002;
            chainName: string;
            assets: {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }[];
            positions: {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }[];
            observedTimestamp: string;
            blockNumber?: string | undefined;
            provenance?: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            } | undefined;
            nativeBalance?: string | undefined;
            errorCode?: string | undefined;
            errorMessage?: string | undefined;
        }[];
        snapshotHash: string;
    };
    opportunities: {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }[];
    eligibleCandidates: {
        opportunity: {
            status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
            chainId: 11155111 | 84532 | 80002;
            name: string;
            protocolId: string;
            assetSymbol: "USDC";
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
            id: string;
            apyBps: number;
            liquidity: string;
            riskScore: number;
            withdrawalKnown: boolean;
            rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
            contractAddress?: string | undefined;
            assetAddress?: string | undefined;
            statusReason?: string | undefined;
        };
        score: {
            netScore: number;
            yieldBenefit: number;
            gasPenalty: number;
            protocolRiskPenalty: number;
            liquidityPenalty: number;
            concentrationPenalty: number;
            uncertaintyPenalty: number;
        };
    }[];
    selectedOpportunity: {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    };
    scoreBreakdown: {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    };
    rejectedCandidates: {
        code: "CHAIN_NOT_ALLOWED" | "PROTOCOL_NOT_ALLOWED" | "ASSET_NOT_ALLOWED" | "CONTRACT_NOT_ALLOWLISTED" | "DATA_STALE" | "PROVENANCE_MISSING" | "RISK_LIMIT_EXCEEDED" | "LIQUIDITY_INSUFFICIENT" | "CONCENTRATION_LIMIT_EXCEEDED" | "NO_MEANINGFUL_IMPROVEMENT" | "ADAPTER_UNAVAILABLE" | "INSUFFICIENT_BALANCE" | "WITHDRAWAL_PATH_UNKNOWN";
        opportunityId: string;
        reason: string;
    }[];
    plan: {
        chainId: 11155111 | 84532 | 80002;
        protocolId: string;
        assetSymbol: "USDC";
        walletAddress: string;
        snapshotHash: string;
        planId: string;
        selectedOpportunityId: string;
        requestedAmount: string;
        deployAmount: string;
        deployAmountBaseUnits: string;
        liquidReserveAmount: string;
        actionType: "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        steps: {
            chainId: 11155111 | 84532 | 80002;
            amountBaseUnits: string;
            protocolId: string;
            order: number;
            kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
            description: string;
            tokenAddress?: string | undefined;
            targetAddress?: string | undefined;
        }[];
        policyHash: string;
        opportunitySetHash: string;
        nonce: string;
        createdAt: string;
        deadline: string;
        planHash: string;
        assetAddress?: string | undefined;
        targetContract?: string | undefined;
    };
    verifications: {
        status: "FAILED" | "SUCCESS" | "PENDING" | "UNVERIFIED";
        chainId: 11155111 | 84532 | 80002;
        observedTimestamp: string;
        kind: "APPROVAL" | "ACTION";
        planHash: string;
        postConditions: {
            expected: string;
            name: string;
            passed: boolean;
            actual: string;
        }[];
        transactionHash: string;
        confirmations: number;
        postConditionsPassed: boolean;
        blockNumber?: string | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        gasUsed?: string | undefined;
    }[];
    finalReceiptHash: string;
    updatedAt: string;
    simulation?: {
        status: "PASSED" | "APPROVAL_REQUIRED" | "FAILED" | "NO_ACTION";
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        planId: string;
        planHash: string;
        success: boolean;
        preConditions: {
            balanceBaseUnits: string;
            allowanceBaseUnits: string;
            targetHasCode: boolean;
        };
        postConditions: {
            minimumWalletBalanceBaseUnits: string;
            expectedPositionIncreaseBaseUnits: string;
        };
        estimatedGas: string;
        simulationHash: string;
        expiresAt: string;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        nextTransaction?: {
            value: string;
            chainId: 11155111 | 84532 | 80002;
            kind: "APPROVAL" | "ACTION";
            description: string;
            from: string;
            to: string;
            data: string;
            gasLimit?: string | undefined;
        } | undefined;
    } | undefined;
    preparedTransaction?: {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        planId: string;
        planHash: string;
        from: string;
        to: string;
        data: string;
        simulationHash: string;
        expiresAt: string;
        warning: string;
        preparedAt: string;
        gasLimit?: string | undefined;
    } | undefined;
    approval?: {
        transactionHash: string;
        mode: "wallet_signature";
        approvedAt: string;
    } | undefined;
}, {
    walletAddress: string;
    policyHash: string;
    createdAt: string;
    receiptVersion: "1.0.0";
    receiptId: string;
    stage: "SIMULATED" | "APPROVAL_REQUIRED" | "FAILED" | "PLANNED" | "PREPARED" | "APPROVAL_VERIFIED" | "EXECUTED";
    intent: {
        assetSymbol: "USDC";
        horizonDays: number;
        requestedAmount: string;
    };
    policy: {
        assetSymbol: "USDC";
        allowedChainIds: (11155111 | 84532 | 80002)[];
        allowedProtocols: string[];
        keepLiquidMinPct: number;
        maxProtocolPct: number;
        requireManualApproval: true;
        maxDataAgeSeconds: number;
        improvementThresholdBps: number;
        maxRiskScore: number;
        maxSlippageBps: number;
        horizonDays: number;
        planTtlSeconds: number;
    };
    snapshot: {
        observedTimestamp: string;
        walletAddress: string;
        chains: {
            status: "LIVE" | "NOT_CONFIGURED" | "ERROR";
            chainId: 11155111 | 84532 | 80002;
            chainName: string;
            observedTimestamp: string;
            blockNumber?: string | undefined;
            provenance?: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            } | undefined;
            nativeBalance?: string | undefined;
            assets?: {
                symbol: string;
                address: string;
                amount: string;
                amountBaseUnits: string;
                decimals: number;
            }[] | undefined;
            positions?: {
                chainId: 11155111 | 84532 | 80002;
                contractAddress: string;
                amount: string;
                protocolId: string;
                assetSymbol: string;
                provenance: {
                    chainId: 11155111 | 84532 | 80002;
                    blockNumber: string;
                    timestamp: string;
                    sourceId: string;
                    adapterVersion: string;
                    dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                    confidence: "HIGH" | "MEDIUM" | "LOW";
                    contractAddress?: string | undefined;
                };
            }[] | undefined;
            errorCode?: string | undefined;
            errorMessage?: string | undefined;
        }[];
        snapshotHash: string;
    };
    opportunities: {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    }[];
    eligibleCandidates: {
        opportunity: {
            status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
            chainId: 11155111 | 84532 | 80002;
            name: string;
            protocolId: string;
            assetSymbol: "USDC";
            provenance: {
                chainId: 11155111 | 84532 | 80002;
                blockNumber: string;
                timestamp: string;
                sourceId: string;
                adapterVersion: string;
                dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
                confidence: "HIGH" | "MEDIUM" | "LOW";
                contractAddress?: string | undefined;
            };
            id: string;
            apyBps: number;
            liquidity: string;
            riskScore: number;
            withdrawalKnown: boolean;
            rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
            contractAddress?: string | undefined;
            assetAddress?: string | undefined;
            statusReason?: string | undefined;
        };
        score: {
            netScore: number;
            yieldBenefit: number;
            gasPenalty: number;
            protocolRiskPenalty: number;
            liquidityPenalty: number;
            concentrationPenalty: number;
            uncertaintyPenalty: number;
        };
    }[];
    selectedOpportunity: {
        status: "LIVE" | "NOT_CONFIGURED" | "UNAVAILABLE";
        chainId: 11155111 | 84532 | 80002;
        name: string;
        protocolId: string;
        assetSymbol: "USDC";
        provenance: {
            chainId: 11155111 | 84532 | 80002;
            blockNumber: string;
            timestamp: string;
            sourceId: string;
            adapterVersion: string;
            dataMode: "LIVE" | "SIMULATED" | "SYSTEM";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            contractAddress?: string | undefined;
        };
        id: string;
        apyBps: number;
        liquidity: string;
        riskScore: number;
        withdrawalKnown: boolean;
        rateLabel: "OBSERVED_TESTNET" | "CONTROLLED_SIMULATION" | "BASELINE";
        contractAddress?: string | undefined;
        assetAddress?: string | undefined;
        statusReason?: string | undefined;
    };
    scoreBreakdown: {
        netScore: number;
        yieldBenefit: number;
        gasPenalty: number;
        protocolRiskPenalty: number;
        liquidityPenalty: number;
        concentrationPenalty: number;
        uncertaintyPenalty: number;
    };
    rejectedCandidates: {
        code: "CHAIN_NOT_ALLOWED" | "PROTOCOL_NOT_ALLOWED" | "ASSET_NOT_ALLOWED" | "CONTRACT_NOT_ALLOWLISTED" | "DATA_STALE" | "PROVENANCE_MISSING" | "RISK_LIMIT_EXCEEDED" | "LIQUIDITY_INSUFFICIENT" | "CONCENTRATION_LIMIT_EXCEEDED" | "NO_MEANINGFUL_IMPROVEMENT" | "ADAPTER_UNAVAILABLE" | "INSUFFICIENT_BALANCE" | "WITHDRAWAL_PATH_UNKNOWN";
        opportunityId: string;
        reason: string;
    }[];
    plan: {
        chainId: 11155111 | 84532 | 80002;
        protocolId: string;
        assetSymbol: "USDC";
        walletAddress: string;
        snapshotHash: string;
        planId: string;
        selectedOpportunityId: string;
        requestedAmount: string;
        deployAmount: string;
        deployAmountBaseUnits: string;
        liquidReserveAmount: string;
        actionType: "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
        steps: {
            chainId: 11155111 | 84532 | 80002;
            amountBaseUnits: string;
            protocolId: string;
            order: number;
            kind: "APPROVE" | "SUPPLY" | "DEPOSIT" | "DO_NOTHING";
            description: string;
            tokenAddress?: string | undefined;
            targetAddress?: string | undefined;
        }[];
        policyHash: string;
        opportunitySetHash: string;
        nonce: string;
        createdAt: string;
        deadline: string;
        planHash: string;
        assetAddress?: string | undefined;
        targetContract?: string | undefined;
    };
    verifications: {
        status: "FAILED" | "SUCCESS" | "PENDING" | "UNVERIFIED";
        chainId: 11155111 | 84532 | 80002;
        observedTimestamp: string;
        kind: "APPROVAL" | "ACTION";
        planHash: string;
        postConditions: {
            expected: string;
            name: string;
            passed: boolean;
            actual: string;
        }[];
        transactionHash: string;
        confirmations: number;
        postConditionsPassed: boolean;
        blockNumber?: string | undefined;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        gasUsed?: string | undefined;
    }[];
    finalReceiptHash: string;
    updatedAt: string;
    simulation?: {
        status: "PASSED" | "APPROVAL_REQUIRED" | "FAILED" | "NO_ACTION";
        chainId: 11155111 | 84532 | 80002;
        blockNumber: string;
        timestamp: string;
        planId: string;
        planHash: string;
        success: boolean;
        preConditions: {
            balanceBaseUnits: string;
            allowanceBaseUnits: string;
            targetHasCode: boolean;
        };
        postConditions: {
            minimumWalletBalanceBaseUnits: string;
            expectedPositionIncreaseBaseUnits: string;
        };
        estimatedGas: string;
        simulationHash: string;
        expiresAt: string;
        errorCode?: string | undefined;
        errorMessage?: string | undefined;
        nextTransaction?: {
            value: string;
            chainId: 11155111 | 84532 | 80002;
            kind: "APPROVAL" | "ACTION";
            description: string;
            from: string;
            to: string;
            data: string;
            gasLimit?: string | undefined;
        } | undefined;
    } | undefined;
    preparedTransaction?: {
        value: string;
        chainId: 11155111 | 84532 | 80002;
        kind: "APPROVAL" | "ACTION";
        description: string;
        planId: string;
        planHash: string;
        from: string;
        to: string;
        data: string;
        simulationHash: string;
        expiresAt: string;
        warning: string;
        preparedAt: string;
        gasLimit?: string | undefined;
    } | undefined;
    approval?: {
        transactionHash: string;
        mode: "wallet_signature";
        approvedAt: string;
    } | undefined;
}>;
export type DecisionReceipt = z.infer<typeof DecisionReceiptSchema>;
export declare const MonitorResultSchema: z.ZodObject<{
    planHash: z.ZodString;
    status: z.ZodEnum<["HEALTHY", "REBALANCE_RECOMMENDED", "DATA_UNAVAILABLE"]>;
    triggers: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        reason: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        code: string;
        reason: string;
    }, {
        code: string;
        reason: string;
    }>, "many">;
    selectedOpportunityId: z.ZodString;
    proposedFollowUp: z.ZodString;
    observedAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    status: "HEALTHY" | "REBALANCE_RECOMMENDED" | "DATA_UNAVAILABLE";
    selectedOpportunityId: string;
    planHash: string;
    triggers: {
        code: string;
        reason: string;
    }[];
    proposedFollowUp: string;
    observedAt: string;
}, {
    status: "HEALTHY" | "REBALANCE_RECOMMENDED" | "DATA_UNAVAILABLE";
    selectedOpportunityId: string;
    planHash: string;
    triggers: {
        code: string;
        reason: string;
    }[];
    proposedFollowUp: string;
    observedAt: string;
}>;
export declare function canonicalJson(value: unknown): string;
export declare function canonicalHash(value: unknown): `0x${string}`;
/** Backward-compatible name; now returns a cryptographic SHA-256 content hash. */
export declare const deterministicHash: typeof canonicalHash;
export declare function hashWithout<T extends Record<string, unknown>>(value: T, ...keys: string[]): `0x${string}`;
export declare function newId(): string;
export declare function refreshReceiptHash(receipt: DecisionReceipt): DecisionReceipt;
//# sourceMappingURL=schemas.d.ts.map