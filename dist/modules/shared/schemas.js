import { createHash, randomUUID } from 'node:crypto';
import { z } from '@nitrostack/core';
export const SUPPORTED_CHAIN_IDS = [11155111, 84532, 80002];
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ChainIdSchema = z.union([
    z.literal(11155111),
    z.literal(84532),
    z.literal(80002),
]);
export const EvmAddressSchema = z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Expected a 20-byte EVM address');
export const TransactionHashSchema = z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Expected a 32-byte transaction hash');
export const ContentHashSchema = z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Expected a SHA-256 content hash');
export const DecimalAmountSchema = z.string()
    .regex(/^(0|[1-9]\d*)(\.\d{1,18})?$/, 'Expected a non-negative decimal amount');
export const BaseUnitAmountSchema = z.string()
    .regex(/^(0|[1-9]\d*)$/, 'Expected an unsigned base-unit integer string');
export const IsoTimestampSchema = z.string().datetime({ offset: true });
export const ChainConfigSchema = z.object({
    chainId: ChainIdSchema,
    name: z.string().min(1),
    rpcUrl: z.string().url().refine((value) => value.startsWith('https://') || value.startsWith('http://'), 'RPC URL must use HTTP(S)').optional(),
    usdcAddress: EvmAddressSchema.optional(),
    aavePoolAddress: EvmAddressSchema.optional(),
    aaveDataProviderAddress: EvmAddressSchema.optional(),
    demoVaultAddress: EvmAddressSchema.optional(),
}).strict();
export const ProvenanceSchema = z.object({
    chainId: ChainIdSchema,
    blockNumber: BaseUnitAmountSchema,
    timestamp: IsoTimestampSchema,
    sourceId: z.string().min(1).max(80),
    adapterVersion: z.string().min(1).max(40),
    contractAddress: EvmAddressSchema.optional(),
    dataMode: z.enum(['LIVE', 'SIMULATED', 'SYSTEM']),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
}).strict();
export const TokenBalanceSchema = z.object({
    symbol: z.string().min(1).max(20),
    address: EvmAddressSchema,
    amount: DecimalAmountSchema,
    amountBaseUnits: BaseUnitAmountSchema,
    decimals: z.number().int().min(0).max(36),
}).strict();
export const ProtocolPositionSchema = z.object({
    protocolId: z.string().min(1),
    chainId: ChainIdSchema,
    assetSymbol: z.string().min(1),
    amount: DecimalAmountSchema,
    contractAddress: EvmAddressSchema,
    provenance: ProvenanceSchema,
}).strict();
export const ChainWalletResultSchema = z.object({
    chainId: ChainIdSchema,
    chainName: z.string().min(1),
    status: z.enum(['LIVE', 'NOT_CONFIGURED', 'ERROR']),
    blockNumber: BaseUnitAmountSchema.optional(),
    nativeBalance: DecimalAmountSchema.optional(),
    assets: z.array(TokenBalanceSchema).default([]),
    positions: z.array(ProtocolPositionSchema).default([]),
    observedTimestamp: IsoTimestampSchema,
    provenance: ProvenanceSchema.optional(),
    errorCode: z.string().optional(),
    errorMessage: z.string().max(300).optional(),
}).strict();
export const WalletSnapshotSchema = z.object({
    walletAddress: EvmAddressSchema,
    chains: z.array(ChainWalletResultSchema).min(1).max(SUPPORTED_CHAIN_IDS.length),
    observedTimestamp: IsoTimestampSchema,
    snapshotHash: ContentHashSchema,
}).strict();
export const OpportunitySchema = z.object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(120),
    protocolId: z.string().min(1).max(80),
    chainId: ChainIdSchema,
    assetSymbol: z.literal('USDC'),
    assetAddress: EvmAddressSchema.optional(),
    apyBps: z.number().int().min(0).max(100_000),
    liquidity: DecimalAmountSchema,
    contractAddress: EvmAddressSchema.optional(),
    riskScore: z.number().int().min(0).max(100),
    withdrawalKnown: z.boolean(),
    rateLabel: z.enum(['OBSERVED_TESTNET', 'CONTROLLED_SIMULATION', 'BASELINE']),
    provenance: ProvenanceSchema,
    status: z.enum(['LIVE', 'NOT_CONFIGURED', 'UNAVAILABLE']),
    statusReason: z.string().max(300).optional(),
}).strict();
export const UserPolicySchema = z.object({
    allowedChainIds: z.array(ChainIdSchema).min(1).max(SUPPORTED_CHAIN_IDS.length),
    allowedProtocols: z.array(z.string().min(1).max(80)).min(1).max(20),
    assetSymbol: z.literal('USDC'),
    keepLiquidMinPct: z.number().int().min(0).max(100),
    maxProtocolPct: z.number().int().min(1).max(100),
    requireManualApproval: z.literal(true),
    maxDataAgeSeconds: z.number().int().min(15).max(3600),
    improvementThresholdBps: z.number().int().min(0).max(10_000),
    maxRiskScore: z.number().int().min(0).max(100),
    maxSlippageBps: z.number().int().min(0).max(1_000),
    horizonDays: z.number().int().min(1).max(3650),
    planTtlSeconds: z.number().int().min(60).max(3600),
}).strict();
export const DEFAULT_USER_POLICY = {
    allowedChainIds: [84532],
    allowedProtocols: ['aave-v3', 'demo-erc4626', 'do-nothing'],
    assetSymbol: 'USDC',
    keepLiquidMinPct: 20,
    maxProtocolPct: 60,
    requireManualApproval: true,
    maxDataAgeSeconds: 180,
    improvementThresholdBps: 10,
    maxRiskScore: 60,
    maxSlippageBps: 50,
    horizonDays: 30,
    planTtlSeconds: 600,
};
export const RejectionCodeSchema = z.enum([
    'CHAIN_NOT_ALLOWED',
    'PROTOCOL_NOT_ALLOWED',
    'ASSET_NOT_ALLOWED',
    'CONTRACT_NOT_ALLOWLISTED',
    'DATA_STALE',
    'PROVENANCE_MISSING',
    'RISK_LIMIT_EXCEEDED',
    'LIQUIDITY_INSUFFICIENT',
    'CONCENTRATION_LIMIT_EXCEEDED',
    'NO_MEANINGFUL_IMPROVEMENT',
    'ADAPTER_UNAVAILABLE',
    'INSUFFICIENT_BALANCE',
    'WITHDRAWAL_PATH_UNKNOWN',
]);
export const RejectionResultSchema = z.object({
    opportunityId: z.string().min(1),
    code: RejectionCodeSchema,
    reason: z.string().min(1).max(500),
}).strict();
export const ScoreBreakdownSchema = z.object({
    netScore: z.number().finite(),
    yieldBenefit: z.number().finite(),
    gasPenalty: z.number().finite(),
    protocolRiskPenalty: z.number().finite(),
    liquidityPenalty: z.number().finite(),
    concentrationPenalty: z.number().finite(),
    uncertaintyPenalty: z.number().finite(),
}).strict();
export const EligibleCandidateSchema = z.object({
    opportunity: OpportunitySchema,
    score: ScoreBreakdownSchema,
}).strict();
export const PlanStepSchema = z.object({
    order: z.number().int().positive(),
    kind: z.enum(['APPROVE', 'SUPPLY', 'DEPOSIT', 'DO_NOTHING']),
    protocolId: z.string().min(1),
    chainId: ChainIdSchema,
    tokenAddress: EvmAddressSchema.optional(),
    targetAddress: EvmAddressSchema.optional(),
    amountBaseUnits: BaseUnitAmountSchema,
    description: z.string().min(1).max(300),
}).strict();
export const ActionPlanSchema = z.object({
    planId: z.string().uuid(),
    walletAddress: EvmAddressSchema,
    selectedOpportunityId: z.string().min(1),
    chainId: ChainIdSchema,
    protocolId: z.string().min(1),
    assetSymbol: z.literal('USDC'),
    assetAddress: EvmAddressSchema.optional(),
    requestedAmount: DecimalAmountSchema,
    deployAmount: DecimalAmountSchema,
    deployAmountBaseUnits: BaseUnitAmountSchema,
    liquidReserveAmount: DecimalAmountSchema,
    targetContract: EvmAddressSchema.optional(),
    actionType: z.enum(['SUPPLY', 'DEPOSIT', 'DO_NOTHING']),
    steps: z.array(PlanStepSchema).min(1).max(4),
    policyHash: ContentHashSchema,
    snapshotHash: ContentHashSchema,
    opportunitySetHash: ContentHashSchema,
    nonce: z.string().uuid(),
    createdAt: IsoTimestampSchema,
    deadline: IsoTimestampSchema,
    planHash: ContentHashSchema,
}).strict();
export const TransactionRequestSchema = z.object({
    kind: z.enum(['APPROVAL', 'ACTION']),
    chainId: ChainIdSchema,
    from: EvmAddressSchema,
    to: EvmAddressSchema,
    data: z.string().regex(/^0x[a-fA-F0-9]*$/, 'Expected hex calldata'),
    value: BaseUnitAmountSchema,
    gasLimit: BaseUnitAmountSchema.optional(),
    description: z.string().min(1).max(300),
}).strict();
export const SimulationResultSchema = z.object({
    planId: z.string().uuid(),
    planHash: ContentHashSchema,
    status: z.enum(['PASSED', 'APPROVAL_REQUIRED', 'FAILED', 'NO_ACTION']),
    success: z.boolean(),
    chainId: ChainIdSchema,
    blockNumber: BaseUnitAmountSchema,
    preConditions: z.object({
        balanceBaseUnits: BaseUnitAmountSchema,
        allowanceBaseUnits: BaseUnitAmountSchema,
        targetHasCode: z.boolean(),
    }).strict(),
    postConditions: z.object({
        minimumWalletBalanceBaseUnits: BaseUnitAmountSchema,
        expectedPositionIncreaseBaseUnits: BaseUnitAmountSchema,
    }).strict(),
    nextTransaction: TransactionRequestSchema.optional(),
    estimatedGas: BaseUnitAmountSchema,
    simulationHash: ContentHashSchema,
    timestamp: IsoTimestampSchema,
    expiresAt: IsoTimestampSchema,
    errorCode: z.string().optional(),
    errorMessage: z.string().max(300).optional(),
}).strict();
export const PreparedTransactionSchema = TransactionRequestSchema.extend({
    planId: z.string().uuid(),
    planHash: ContentHashSchema,
    simulationHash: ContentHashSchema,
    warning: z.string().min(1).max(500),
    preparedAt: IsoTimestampSchema,
    expiresAt: IsoTimestampSchema,
}).strict();
export const ExecutionVerificationSchema = z.object({
    chainId: ChainIdSchema,
    transactionHash: TransactionHashSchema,
    planHash: ContentHashSchema,
    kind: z.enum(['APPROVAL', 'ACTION']),
    status: z.enum(['SUCCESS', 'FAILED', 'PENDING', 'UNVERIFIED']),
    blockNumber: BaseUnitAmountSchema.optional(),
    gasUsed: BaseUnitAmountSchema.optional(),
    confirmations: z.number().int().min(0),
    postConditionsPassed: z.boolean(),
    postConditions: z.array(z.object({
        name: z.string().min(1),
        passed: z.boolean(),
        expected: z.string(),
        actual: z.string(),
    }).strict()),
    observedTimestamp: IsoTimestampSchema,
    errorCode: z.string().optional(),
    errorMessage: z.string().max(300).optional(),
}).strict();
export const DecisionReceiptSchema = z.object({
    receiptVersion: z.literal('1.0.0'),
    receiptId: z.string().uuid(),
    stage: z.enum(['PLANNED', 'APPROVAL_REQUIRED', 'SIMULATED', 'PREPARED', 'APPROVAL_VERIFIED', 'EXECUTED', 'FAILED']),
    walletAddress: EvmAddressSchema,
    intent: z.object({
        assetSymbol: z.literal('USDC'),
        requestedAmount: DecimalAmountSchema,
        horizonDays: z.number().int().positive(),
    }).strict(),
    policy: UserPolicySchema,
    policyHash: ContentHashSchema,
    snapshot: WalletSnapshotSchema,
    opportunities: z.array(OpportunitySchema),
    eligibleCandidates: z.array(EligibleCandidateSchema),
    selectedOpportunity: OpportunitySchema,
    scoreBreakdown: ScoreBreakdownSchema,
    rejectedCandidates: z.array(RejectionResultSchema),
    plan: ActionPlanSchema,
    simulation: SimulationResultSchema.optional(),
    preparedTransaction: PreparedTransactionSchema.optional(),
    verifications: z.array(ExecutionVerificationSchema),
    approval: z.object({
        mode: z.literal('wallet_signature'),
        transactionHash: TransactionHashSchema,
        approvedAt: IsoTimestampSchema,
    }).strict().optional(),
    finalReceiptHash: ContentHashSchema,
    createdAt: IsoTimestampSchema,
    updatedAt: IsoTimestampSchema,
}).strict();
export const MonitorResultSchema = z.object({
    planHash: ContentHashSchema,
    status: z.enum(['HEALTHY', 'REBALANCE_RECOMMENDED', 'DATA_UNAVAILABLE']),
    triggers: z.array(z.object({
        code: z.string(),
        reason: z.string(),
    }).strict()),
    selectedOpportunityId: z.string(),
    proposedFollowUp: z.string(),
    observedAt: IsoTimestampSchema,
}).strict();
function canonicalize(value) {
    if (value === null || typeof value === 'boolean' || typeof value === 'string')
        return value;
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            throw new Error('Cannot hash a non-finite number');
        return value;
    }
    if (typeof value === 'bigint')
        return value.toString();
    if (Array.isArray(value))
        return value.map(canonicalize);
    if (value && typeof value === 'object') {
        const result = {};
        for (const key of Object.keys(value).sort()) {
            const child = value[key];
            if (child !== undefined)
                result[key] = canonicalize(child);
        }
        return result;
    }
    throw new Error(`Cannot hash value of type ${typeof value}`);
}
export function canonicalJson(value) {
    return JSON.stringify(canonicalize(value));
}
export function canonicalHash(value) {
    return `0x${createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')}`;
}
/** Backward-compatible name; now returns a cryptographic SHA-256 content hash. */
export const deterministicHash = canonicalHash;
export function hashWithout(value, ...keys) {
    const copy = { ...value };
    for (const key of keys)
        delete copy[key];
    return canonicalHash(copy);
}
export function newId() {
    return randomUUID();
}
export function refreshReceiptHash(receipt) {
    const updatedAt = new Date().toISOString();
    const next = { ...receipt, updatedAt, finalReceiptHash: `0x${'0'.repeat(64)}` };
    next.finalReceiptHash = hashWithout(next, 'finalReceiptHash');
    return DecisionReceiptSchema.parse(next);
}
//# sourceMappingURL=schemas.js.map