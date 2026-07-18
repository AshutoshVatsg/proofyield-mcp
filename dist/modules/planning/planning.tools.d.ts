import { ExecutionContext, z } from '@nitrostack/core';
import { ProofYieldConfigService } from '../shared/config.service.js';
import { ReceiptRepository } from '../shared/receipt.repository.js';
import { EvidenceRepository } from '../shared/evidence.repository.js';
import { ChainId, DecisionReceipt, ExecutionVerification, Opportunity, PreparedTransaction, SimulationResult } from '../shared/schemas.js';
declare const CreatePlanInputSchema: z.ZodObject<{
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
    policy: z.ZodOptional<z.ZodObject<{
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
    }>>;
    amount: z.ZodString;
}, "strict", z.ZodTypeAny, {
    amount: string;
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
    policy?: {
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
    } | undefined;
}, {
    amount: string;
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
    policy?: {
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
    } | undefined;
}>;
export declare class PlanningTools {
    private readonly receiptRepository;
    private readonly configService;
    private readonly evidenceRepository;
    constructor(receiptRepository: ReceiptRepository, configService: ProofYieldConfigService, evidenceRepository: EvidenceRepository);
    createPlan(input: z.infer<typeof CreatePlanInputSchema>, context: ExecutionContext): Promise<DecisionReceipt>;
    simulatePlan(input: {
        planHash: string;
    }, context: ExecutionContext): Promise<SimulationResult>;
    prepareExecution(input: {
        planHash: string;
    }, _context: ExecutionContext): Promise<PreparedTransaction>;
    verifyExecution(input: {
        chainId: ChainId;
        transactionHash: string;
        planHash: string;
    }, context: ExecutionContext): Promise<ExecutionVerification>;
    getReceipt(input: {
        idOrHash: string;
    }, _context: ExecutionContext): Promise<DecisionReceipt>;
    monitorCheck(input: {
        planHash: string;
        currentOpportunities: Opportunity[];
    }, _context: ExecutionContext): Promise<{
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
    private requireReceipt;
    private validateStoredPlan;
    private simulateProtocolAction;
}
export {};
//# sourceMappingURL=planning.tools.d.ts.map