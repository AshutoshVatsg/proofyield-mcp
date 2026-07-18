var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, RateLimit, ToolDecorator as Tool, z, } from '@nitrostack/core';
import { createPublicClient, encodeFunctionData, formatUnits, http, parseUnits, } from 'viem';
import { ProofYieldConfigService } from '../shared/config.service.js';
import { ReceiptRepository } from '../shared/receipt.repository.js';
import { EvidenceRepository } from '../shared/evidence.repository.js';
import { ActionPlanSchema, ChainIdSchema, ContentHashSchema, DEFAULT_USER_POLICY, DecisionReceiptSchema, ExecutionVerificationSchema, MonitorResultSchema, OpportunitySchema, PreparedTransactionSchema, SimulationResultSchema, TransactionHashSchema, UserPolicySchema, WalletSnapshotSchema, canonicalHash, hashWithout, newId, refreshReceiptHash, } from '../shared/schemas.js';
const ERC20_ABI = [
    {
        type: 'function', stateMutability: 'view', name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: 'balance', type: 'uint256' }],
    },
    {
        type: 'function', stateMutability: 'view', name: 'allowance',
        inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
        outputs: [{ name: 'allowance', type: 'uint256' }],
    },
    {
        type: 'function', stateMutability: 'view', name: 'decimals',
        inputs: [], outputs: [{ name: 'decimals', type: 'uint8' }],
    },
    {
        type: 'function', stateMutability: 'nonpayable', name: 'approve',
        inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
        outputs: [{ name: 'success', type: 'bool' }],
    },
];
const AAVE_POOL_ABI = [
    {
        type: 'function', stateMutability: 'nonpayable', name: 'supply',
        inputs: [
            { name: 'asset', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'onBehalfOf', type: 'address' },
            { name: 'referralCode', type: 'uint16' },
        ],
        outputs: [],
    },
];
const ERC4626_ABI = [
    {
        type: 'function', stateMutability: 'nonpayable', name: 'deposit',
        inputs: [{ name: 'assets', type: 'uint256' }, { name: 'receiver', type: 'address' }],
        outputs: [{ name: 'shares', type: 'uint256' }],
    },
    {
        type: 'function', stateMutability: 'view', name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: 'shares', type: 'uint256' }],
    },
];
const CreatePlanInputSchema = z.object({
    snapshot: WalletSnapshotSchema,
    opportunities: z.array(OpportunitySchema).min(1).max(50),
    policy: UserPolicySchema.optional(),
    amount: z.string().regex(/^(0|[1-9]\d*)(\.\d{1,18})?$/),
}).strict();
let PlanningTools = class PlanningTools {
    receiptRepository;
    configService;
    evidenceRepository;
    constructor(receiptRepository, configService, evidenceRepository) {
        this.receiptRepository = receiptRepository;
        this.configService = configService;
        this.evidenceRepository = evidenceRepository;
    }
    async createPlan(input, context) {
        const snapshot = WalletSnapshotSchema.parse(input.snapshot);
        const policy = UserPolicySchema.parse(input.policy ?? DEFAULT_USER_POLICY);
        const suppliedOpportunities = z.array(OpportunitySchema).parse(input.opportunities);
        const requestedAmount = input.amount;
        const expectedSnapshotHash = hashWithout(snapshot, 'snapshotHash');
        if (snapshot.snapshotHash !== expectedSnapshotHash)
            throw new Error('Snapshot hash mismatch; refresh the wallet snapshot.');
        if (!this.evidenceRepository.matchesSnapshot(snapshot))
            throw new Error('Snapshot was not issued by this ProofYield server; refresh discovery evidence.');
        if (!this.evidenceRepository.matchesOpportunities(suppliedOpportunities, { walletAddress: snapshot.walletAddress, amount: requestedAmount })) {
            throw new Error('Opportunity set was not issued for this wallet and amount by this ProofYield server; rescan opportunities.');
        }
        const opportunities = ensureDoNothingCandidate(suppliedOpportunities, snapshot, policy);
        const opportunitySetHash = canonicalHash(opportunities);
        const policyHash = canonicalHash(policy);
        const rejected = [];
        const eligible = [];
        const deployAmounts = new Map();
        const nowMs = Date.now();
        for (const opportunity of opportunities) {
            const reject = (code, reason) => {
                rejected.push({ opportunityId: opportunity.id, code, reason });
            };
            if (opportunity.status !== 'LIVE') {
                reject('ADAPTER_UNAVAILABLE', opportunity.statusReason ?? `Adapter status is ${opportunity.status}.`);
                continue;
            }
            if (!policy.allowedChainIds.includes(opportunity.chainId)) {
                reject('CHAIN_NOT_ALLOWED', `Chain ${opportunity.chainId} is not allowed by policy.`);
                continue;
            }
            if (!policy.allowedProtocols.includes(opportunity.protocolId)) {
                reject('PROTOCOL_NOT_ALLOWED', `Protocol ${opportunity.protocolId} is not allowed by policy.`);
                continue;
            }
            if (opportunity.assetSymbol !== policy.assetSymbol) {
                reject('ASSET_NOT_ALLOWED', `Asset ${opportunity.assetSymbol} does not match ${policy.assetSymbol}.`);
                continue;
            }
            const chainSnapshot = snapshot.chains.find((chain) => chain.chainId === opportunity.chainId && chain.status === 'LIVE');
            if (!chainSnapshot) {
                reject('CHAIN_NOT_ALLOWED', `No live validated wallet snapshot exists for chain ${opportunity.chainId}.`);
                continue;
            }
            if (opportunity.protocolId === 'do-nothing') {
                const isTrustedBaseline = opportunity.provenance.sourceId === 'proofyield-policy-baseline'
                    && opportunity.provenance.dataMode === 'SYSTEM'
                    && opportunity.contractAddress === undefined;
                if (!isTrustedBaseline) {
                    reject('PROVENANCE_MISSING', 'The liquid baseline was not produced by the ProofYield policy engine.');
                    continue;
                }
                const walletAsset = chainSnapshot.assets.find((asset) => asset.symbol === policy.assetSymbol
                    && (!opportunity.assetAddress || asset.address.toLowerCase() === opportunity.assetAddress.toLowerCase()));
                if (!walletAsset) {
                    reject('INSUFFICIENT_BALANCE', `No validated ${policy.assetSymbol} balance exists on ${chainSnapshot.chainName}.`);
                    continue;
                }
                let requestedBaseUnits;
                try {
                    requestedBaseUnits = parseUnits(requestedAmount, walletAsset.decimals);
                }
                catch {
                    reject('INSUFFICIENT_BALANCE', 'Requested amount precision exceeds the configured token decimals.');
                    continue;
                }
                if (requestedBaseUnits <= 0n || requestedBaseUnits > BigInt(walletAsset.amountBaseUnits)) {
                    reject('INSUFFICIENT_BALANCE', `Requested ${requestedAmount} ${policy.assetSymbol} exceeds the validated wallet balance ${walletAsset.amount}.`);
                    continue;
                }
                eligible.push({ opportunity, score: zeroScore() });
                deployAmounts.set(opportunity.id, { decimals: walletAsset.decimals, baseUnits: 0n, formatted: '0', reserve: requestedAmount });
                continue;
            }
            const dataAgeSeconds = (nowMs - Date.parse(opportunity.provenance.timestamp)) / 1000;
            if (!Number.isFinite(dataAgeSeconds) || dataAgeSeconds < -30 || dataAgeSeconds > policy.maxDataAgeSeconds) {
                reject('DATA_STALE', `Opportunity data age is outside the allowed ${policy.maxDataAgeSeconds}-second window.`);
                continue;
            }
            if (!this.configService.isTrustedTarget(opportunity.protocolId, opportunity.chainId, opportunity.contractAddress)) {
                reject('CONTRACT_NOT_ALLOWLISTED', 'Target does not match the versioned server-side adapter registry.');
                continue;
            }
            const adapter = this.configService.getAdapter(opportunity.protocolId, opportunity.chainId);
            if (!adapter || opportunity.assetAddress?.toLowerCase() !== adapter.assetAddress.toLowerCase()) {
                reject('CONTRACT_NOT_ALLOWLISTED', 'Asset or adapter binding does not match trusted configuration.');
                continue;
            }
            if (opportunity.riskScore > policy.maxRiskScore) {
                reject('RISK_LIMIT_EXCEEDED', `Risk score ${opportunity.riskScore} exceeds policy maximum ${policy.maxRiskScore}.`);
                continue;
            }
            if (!opportunity.withdrawalKnown) {
                reject('WITHDRAWAL_PATH_UNKNOWN', 'A validated withdrawal path is required.');
                continue;
            }
            const walletAsset = chainSnapshot.assets.find((asset) => asset.symbol === policy.assetSymbol && asset.address.toLowerCase() === adapter.assetAddress.toLowerCase());
            if (!walletAsset) {
                reject('INSUFFICIENT_BALANCE', `No validated ${policy.assetSymbol} balance exists on ${chainSnapshot.chainName}.`);
                continue;
            }
            let requestedBaseUnits;
            let liquidityBaseUnits;
            try {
                requestedBaseUnits = parseUnits(requestedAmount, walletAsset.decimals);
                liquidityBaseUnits = parseUnits(opportunity.liquidity, walletAsset.decimals);
            }
            catch {
                reject('INSUFFICIENT_BALANCE', 'Amount or liquidity precision exceeds the configured token decimals.');
                continue;
            }
            const walletBalance = BigInt(walletAsset.amountBaseUnits);
            if (requestedBaseUnits <= 0n || requestedBaseUnits > walletBalance) {
                reject('INSUFFICIENT_BALANCE', `Requested ${requestedAmount} ${policy.assetSymbol} exceeds the validated wallet balance ${walletAsset.amount}.`);
                continue;
            }
            const reserveBound = percentage(requestedBaseUnits, 100 - policy.keepLiquidMinPct);
            let allPositionBaseUnits = 0n;
            let existingProtocolBaseUnits = 0n;
            try {
                for (const position of chainSnapshot.positions.filter((item) => item.assetSymbol === policy.assetSymbol)) {
                    const positionAmount = parseUnits(position.amount, walletAsset.decimals);
                    allPositionBaseUnits += positionAmount;
                    if (position.protocolId === opportunity.protocolId)
                        existingProtocolBaseUnits += positionAmount;
                }
            }
            catch {
                reject('PROVENANCE_MISSING', 'A current protocol position could not be normalized to the trusted token decimals.');
                continue;
            }
            const portfolioBaseUnits = walletBalance + allPositionBaseUnits;
            const maxProtocolBaseUnits = percentage(portfolioBaseUnits, policy.maxProtocolPct);
            const remainingProtocolCapacity = maxProtocolBaseUnits > existingProtocolBaseUnits
                ? maxProtocolBaseUnits - existingProtocolBaseUnits
                : 0n;
            const concentrationBound = minBigInt(percentage(requestedBaseUnits, policy.maxProtocolPct), remainingProtocolCapacity);
            const deployBaseUnits = minBigInt(reserveBound, concentrationBound);
            if (deployBaseUnits <= 0n) {
                reject('CONCENTRATION_LIMIT_EXCEEDED', 'The existing position and requested allocation leave no capacity under the protocol concentration limit.');
                continue;
            }
            if (liquidityBaseUnits < deployBaseUnits) {
                reject('LIQUIDITY_INSUFFICIENT', `Available liquidity ${opportunity.liquidity} is below the bounded deployment amount.`);
                continue;
            }
            const score = scoreOpportunity(opportunity, policy);
            if (score.netScore < policy.improvementThresholdBps) {
                reject('NO_MEANINGFUL_IMPROVEMENT', `Net score ${score.netScore} bps is below policy threshold ${policy.improvementThresholdBps} bps.`);
                continue;
            }
            const reserveBaseUnits = requestedBaseUnits - deployBaseUnits;
            deployAmounts.set(opportunity.id, {
                decimals: walletAsset.decimals,
                baseUnits: deployBaseUnits,
                formatted: formatUnits(deployBaseUnits, walletAsset.decimals),
                reserve: formatUnits(reserveBaseUnits, walletAsset.decimals),
            });
            eligible.push({ opportunity, score });
        }
        eligible.sort((a, b) => b.score.netScore - a.score.netScore || a.opportunity.id.localeCompare(b.opportunity.id));
        const selected = eligible[0];
        if (!selected)
            throw new Error('No safe candidate exists. Refresh data or adjust the policy without weakening address/simulation controls.');
        const deploy = deployAmounts.get(selected.opportunity.id);
        const createdAt = new Date().toISOString();
        const deadline = new Date(Date.now() + policy.planTtlSeconds * 1000).toISOString();
        const actionType = selected.opportunity.protocolId === 'do-nothing'
            ? 'DO_NOTHING'
            : selected.opportunity.protocolId === 'aave-v3' ? 'SUPPLY' : 'DEPOSIT';
        const steps = actionType === 'DO_NOTHING'
            ? [{ order: 1, kind: 'DO_NOTHING', protocolId: 'do-nothing', chainId: selected.opportunity.chainId, amountBaseUnits: '0', description: 'Keep the requested USDC liquid; no wallet transaction is required.' }]
            : [
                {
                    order: 1,
                    kind: 'APPROVE',
                    protocolId: selected.opportunity.protocolId,
                    chainId: selected.opportunity.chainId,
                    tokenAddress: selected.opportunity.assetAddress,
                    targetAddress: selected.opportunity.contractAddress,
                    amountBaseUnits: deploy.baseUnits.toString(),
                    description: `Approve exactly ${deploy.formatted} USDC for the allowlisted adapter if current allowance is insufficient.`,
                },
                {
                    order: 2,
                    kind: actionType,
                    protocolId: selected.opportunity.protocolId,
                    chainId: selected.opportunity.chainId,
                    tokenAddress: selected.opportunity.assetAddress,
                    targetAddress: selected.opportunity.contractAddress,
                    amountBaseUnits: deploy.baseUnits.toString(),
                    description: `${actionType === 'SUPPLY' ? 'Supply' : 'Deposit'} ${deploy.formatted} USDC through the allowlisted ${selected.opportunity.name} adapter.`,
                },
            ];
        const planDraft = {
            planId: newId(),
            walletAddress: snapshot.walletAddress,
            selectedOpportunityId: selected.opportunity.id,
            chainId: selected.opportunity.chainId,
            protocolId: selected.opportunity.protocolId,
            assetSymbol: 'USDC',
            assetAddress: selected.opportunity.assetAddress,
            requestedAmount,
            deployAmount: deploy.formatted,
            deployAmountBaseUnits: deploy.baseUnits.toString(),
            liquidReserveAmount: deploy.reserve,
            targetContract: selected.opportunity.contractAddress,
            actionType,
            steps,
            policyHash,
            snapshotHash: snapshot.snapshotHash,
            opportunitySetHash,
            nonce: newId(),
            createdAt,
            deadline,
            planHash: `0x${'0'.repeat(64)}`,
        };
        planDraft.planHash = hashWithout(planDraft, 'planHash');
        const plan = ActionPlanSchema.parse(planDraft);
        let receipt = {
            receiptVersion: '1.0.0',
            receiptId: newId(),
            stage: 'PLANNED',
            walletAddress: snapshot.walletAddress,
            intent: { assetSymbol: 'USDC', requestedAmount, horizonDays: policy.horizonDays },
            policy,
            policyHash,
            snapshot,
            opportunities,
            eligibleCandidates: eligible,
            selectedOpportunity: selected.opportunity,
            scoreBreakdown: selected.score,
            rejectedCandidates: rejected,
            plan,
            verifications: [],
            finalReceiptHash: `0x${'0'.repeat(64)}`,
            createdAt,
            updatedAt: createdAt,
        };
        receipt = refreshReceiptHash(receipt);
        context.logger.info(`Created policy-bounded plan ${plan.planId}`);
        return this.receiptRepository.save(receipt);
    }
    async simulatePlan(input, context) {
        let receipt = this.requireReceipt(input.planHash);
        const plan = receipt.plan;
        this.validateStoredPlan(receipt);
        if (receipt.stage === 'EXECUTED')
            throw new Error('This plan has already executed and cannot be replayed.');
        if (receipt.stage === 'FAILED')
            throw new Error('This plan is closed after a failed execution; create a fresh plan.');
        if (Date.parse(plan.deadline) <= Date.now())
            throw new Error('Plan expired; create a fresh plan from current data.');
        if (plan.actionType === 'DO_NOTHING') {
            const blockNumber = receipt.selectedOpportunity.provenance.blockNumber;
            const simulation = finalizeSimulation({
                planId: plan.planId,
                planHash: plan.planHash,
                status: 'NO_ACTION',
                success: true,
                chainId: plan.chainId,
                blockNumber,
                preConditions: { balanceBaseUnits: '0', allowanceBaseUnits: '0', targetHasCode: true },
                postConditions: { minimumWalletBalanceBaseUnits: '0', expectedPositionIncreaseBaseUnits: '0' },
                estimatedGas: '0',
                timestamp: new Date().toISOString(),
                expiresAt: plan.deadline,
            });
            receipt.simulation = simulation;
            receipt.stage = 'SIMULATED';
            receipt = refreshReceiptHash(receipt);
            this.receiptRepository.save(receipt);
            return simulation;
        }
        const adapter = this.configService.getAdapter(plan.protocolId, plan.chainId);
        const chain = this.configService.getChainConfig(plan.chainId);
        if (!adapter || !chain.rpcUrl || !plan.assetAddress || !plan.targetContract)
            throw new Error('The plan adapter is no longer configured.');
        if (!this.configService.isTrustedTarget(plan.protocolId, plan.chainId, plan.targetContract))
            throw new Error('Plan target is no longer allowlisted.');
        const client = createPublicClient({ transport: http(chain.rpcUrl, { timeout: 10_000, retryCount: 1 }) });
        let blockNumber = '0';
        let balance = 0n;
        let allowance = 0n;
        const amount = BigInt(plan.deployAmountBaseUnits);
        try {
            const [rpcChainId, block, balanceValue, allowanceValue, targetCode] = await Promise.all([
                client.getChainId(),
                client.getBlockNumber(),
                client.readContract({ address: adapter.assetAddress, abi: ERC20_ABI, functionName: 'balanceOf', args: [plan.walletAddress] }),
                client.readContract({ address: adapter.assetAddress, abi: ERC20_ABI, functionName: 'allowance', args: [plan.walletAddress, adapter.targetAddress] }),
                client.getBytecode({ address: adapter.targetAddress }),
            ]);
            if (rpcChainId !== plan.chainId)
                throw new Error(`RPC chain ${rpcChainId} does not match plan chain ${plan.chainId}.`);
            blockNumber = block.toString();
            balance = balanceValue;
            allowance = allowanceValue;
            if (!targetCode)
                throw new Error('Allowlisted target has no bytecode.');
            if (balance < amount)
                throw new Error('Live USDC balance is below the bounded deployment amount.');
            const timestamp = new Date().toISOString();
            const expiresAt = new Date(Math.min(Date.parse(plan.deadline), Date.now() + 120_000)).toISOString();
            const expectedWalletBalance = (balance - amount).toString();
            if (allowance < amount) {
                const data = encodeFunctionData({ abi: ERC20_ABI, functionName: 'approve', args: [adapter.targetAddress, amount] });
                const gas = await client.estimateContractGas({
                    address: adapter.assetAddress,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [adapter.targetAddress, amount],
                    account: plan.walletAddress,
                });
                const nextTransaction = {
                    kind: 'APPROVAL',
                    chainId: plan.chainId,
                    from: plan.walletAddress,
                    to: adapter.assetAddress,
                    data,
                    value: '0',
                    gasLimit: applyGasBuffer(gas).toString(),
                    description: `Approve exactly ${plan.deployAmount} USDC to the allowlisted ${plan.protocolId} adapter.`,
                };
                const simulation = finalizeSimulation({
                    planId: plan.planId,
                    planHash: plan.planHash,
                    status: 'APPROVAL_REQUIRED',
                    success: false,
                    chainId: plan.chainId,
                    blockNumber,
                    preConditions: { balanceBaseUnits: balance.toString(), allowanceBaseUnits: allowance.toString(), targetHasCode: true },
                    postConditions: { minimumWalletBalanceBaseUnits: expectedWalletBalance, expectedPositionIncreaseBaseUnits: amount.toString() },
                    nextTransaction,
                    estimatedGas: gas.toString(),
                    timestamp,
                    expiresAt,
                });
                receipt.simulation = simulation;
                receipt.stage = 'APPROVAL_REQUIRED';
                receipt.preparedTransaction = undefined;
                receipt = refreshReceiptHash(receipt);
                this.receiptRepository.save(receipt);
                return simulation;
            }
            const nextTransaction = await this.simulateProtocolAction(client, plan, amount);
            const simulation = finalizeSimulation({
                planId: plan.planId,
                planHash: plan.planHash,
                status: 'PASSED',
                success: true,
                chainId: plan.chainId,
                blockNumber,
                preConditions: { balanceBaseUnits: balance.toString(), allowanceBaseUnits: allowance.toString(), targetHasCode: true },
                postConditions: { minimumWalletBalanceBaseUnits: expectedWalletBalance, expectedPositionIncreaseBaseUnits: amount.toString() },
                nextTransaction,
                estimatedGas: nextTransaction.gasLimit ?? '0',
                timestamp,
                expiresAt,
            });
            receipt.simulation = simulation;
            receipt.stage = 'SIMULATED';
            receipt.preparedTransaction = undefined;
            receipt = refreshReceiptHash(receipt);
            this.receiptRepository.save(receipt);
            return simulation;
        }
        catch (error) {
            context.logger.warn(`Plan simulation failed for ${plan.planId}`);
            const simulation = finalizeSimulation({
                planId: plan.planId,
                planHash: plan.planHash,
                status: 'FAILED',
                success: false,
                chainId: plan.chainId,
                blockNumber,
                preConditions: { balanceBaseUnits: balance.toString(), allowanceBaseUnits: allowance.toString(), targetHasCode: false },
                postConditions: { minimumWalletBalanceBaseUnits: '0', expectedPositionIncreaseBaseUnits: '0' },
                estimatedGas: '0',
                timestamp: new Date().toISOString(),
                expiresAt: plan.deadline,
                errorCode: 'SIMULATION_FAILED',
                errorMessage: sanitizeError(error),
            });
            receipt.simulation = simulation;
            receipt.stage = 'FAILED';
            receipt.preparedTransaction = undefined;
            receipt = refreshReceiptHash(receipt);
            this.receiptRepository.save(receipt);
            return simulation;
        }
    }
    async prepareExecution(input, _context) {
        let receipt = this.requireReceipt(input.planHash);
        this.validateStoredPlan(receipt);
        if (receipt.stage === 'EXECUTED' || receipt.stage === 'FAILED')
            throw new Error('This plan is closed and cannot prepare another transaction.');
        const simulation = receipt.simulation;
        if (!simulation || !simulation.nextTransaction)
            throw new Error('No simulated transaction is available for this plan.');
        if (!['APPROVAL_REQUIRED', 'PASSED'].includes(simulation.status))
            throw new Error(`Simulation status ${simulation.status} cannot be prepared.`);
        if (Date.parse(simulation.expiresAt) <= Date.now() || Date.parse(receipt.plan.deadline) <= Date.now())
            throw new Error('Simulation or plan expired; simulate again.');
        const expectedSimulationHash = hashWithout(simulation, 'simulationHash');
        if (simulation.simulationHash !== expectedSimulationHash)
            throw new Error('Simulation hash mismatch.');
        const transaction = simulation.nextTransaction;
        const adapter = this.configService.getAdapter(receipt.plan.protocolId, receipt.plan.chainId);
        if (!adapter)
            throw new Error('Adapter is not configured.');
        const expectedTo = transaction.kind === 'APPROVAL' ? adapter.assetAddress : adapter.targetAddress;
        if (transaction.to.toLowerCase() !== expectedTo.toLowerCase() || transaction.from.toLowerCase() !== receipt.walletAddress.toLowerCase()) {
            throw new Error('Simulated transaction no longer matches the trusted adapter or wallet.');
        }
        const preparedAt = new Date().toISOString();
        const prepared = PreparedTransactionSchema.parse({
            ...transaction,
            planId: receipt.plan.planId,
            planHash: receipt.plan.planHash,
            simulationHash: simulation.simulationHash,
            warning: transaction.kind === 'APPROVAL'
                ? 'Testnet only. This is an exact bounded approval, not an unlimited approval. Confirm token, spender, and amount in your wallet.'
                : 'Testnet only. Confirm the allowlisted protocol, chain, and bounded amount in your wallet before signing.',
            preparedAt,
            expiresAt: simulation.expiresAt,
        });
        receipt.preparedTransaction = prepared;
        receipt.stage = 'PREPARED';
        receipt = refreshReceiptHash(receipt);
        this.receiptRepository.save(receipt);
        return prepared;
    }
    async verifyExecution(input, context) {
        let decisionReceipt = this.requireReceipt(input.planHash);
        const prepared = decisionReceipt.preparedTransaction;
        if (!prepared)
            throw new Error('No prepared transaction exists for this plan.');
        if (input.chainId !== prepared.chainId || input.chainId !== decisionReceipt.plan.chainId)
            throw new Error('Transaction chain does not match the plan.');
        const existing = decisionReceipt.verifications.find((item) => item.transactionHash.toLowerCase() === input.transactionHash.toLowerCase());
        if (existing)
            return existing;
        if (this.receiptRepository.hasVerifiedTransaction(input.transactionHash))
            throw new Error('Transaction hash is already bound to another receipt.');
        const chain = this.configService.getChainConfig(input.chainId);
        if (!chain.rpcUrl)
            throw new Error('RPC is not configured for verification.');
        const client = createPublicClient({ transport: http(chain.rpcUrl, { timeout: 10_000, retryCount: 1 }) });
        const observedTimestamp = new Date().toISOString();
        try {
            const txHash = TransactionHashSchema.parse(input.transactionHash);
            const [rpcChainId, transactionReceipt, transaction, currentBlock] = await Promise.all([
                client.getChainId(),
                client.getTransactionReceipt({ hash: txHash }),
                client.getTransaction({ hash: txHash }),
                client.getBlockNumber(),
            ]);
            if (rpcChainId !== input.chainId)
                throw new Error(`RPC chain ${rpcChainId} does not match verification chain ${input.chainId}.`);
            const confirmations = Number(currentBlock >= transactionReceipt.blockNumber ? currentBlock - transactionReceipt.blockNumber + 1n : 0n);
            const envelopeMatches = Boolean(transaction.from.toLowerCase() === prepared.from.toLowerCase()
                && transaction.chainId === prepared.chainId
                && transaction.to?.toLowerCase() === prepared.to.toLowerCase()
                && transaction.input.toLowerCase() === prepared.data.toLowerCase()
                && transaction.value.toString() === prepared.value);
            const receiptSucceeded = transactionReceipt.status === 'success';
            const postConditions = [
                { name: 'transaction-envelope', passed: envelopeMatches, expected: `${prepared.from} -> ${prepared.to}`, actual: `${transaction.from} -> ${transaction.to ?? 'contract creation'}` },
                { name: 'receipt-status', passed: receiptSucceeded, expected: 'success', actual: transactionReceipt.status },
            ];
            const adapter = this.configService.getAdapter(decisionReceipt.plan.protocolId, decisionReceipt.plan.chainId);
            if (!adapter)
                throw new Error('Adapter configuration was removed before verification.');
            if (prepared.kind === 'APPROVAL') {
                const allowance = await client.readContract({
                    address: adapter.assetAddress,
                    abi: ERC20_ABI,
                    functionName: 'allowance',
                    args: [decisionReceipt.plan.walletAddress, adapter.targetAddress],
                    blockNumber: transactionReceipt.blockNumber,
                });
                const allowancePassed = allowance >= BigInt(decisionReceipt.plan.deployAmountBaseUnits);
                postConditions.push({
                    name: 'exact-or-sufficient-allowance',
                    passed: allowancePassed,
                    expected: `>=${decisionReceipt.plan.deployAmountBaseUnits}`,
                    actual: allowance.toString(),
                });
            }
            else {
                const walletBalance = await client.readContract({
                    address: adapter.assetAddress,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [decisionReceipt.plan.walletAddress],
                    blockNumber: transactionReceipt.blockNumber,
                });
                const expectedBalance = BigInt(decisionReceipt.simulation.postConditions.minimumWalletBalanceBaseUnits);
                const balancePassed = walletBalance === expectedBalance;
                postConditions.push({
                    name: 'wallet-usdc-delta',
                    passed: balancePassed,
                    expected: expectedBalance.toString(),
                    actual: walletBalance.toString(),
                });
                if (decisionReceipt.plan.protocolId === 'demo-erc4626') {
                    const shares = await client.readContract({
                        address: adapter.targetAddress,
                        abi: ERC4626_ABI,
                        functionName: 'balanceOf',
                        args: [decisionReceipt.plan.walletAddress],
                        blockNumber: transactionReceipt.blockNumber,
                    });
                    postConditions.push({ name: 'vault-shares-received', passed: shares > 0n, expected: '>0', actual: shares.toString() });
                }
            }
            const postConditionsPassed = postConditions.every((condition) => condition.passed);
            const status = !receiptSucceeded
                ? 'FAILED'
                : envelopeMatches && postConditionsPassed ? 'SUCCESS' : 'UNVERIFIED';
            const verification = ExecutionVerificationSchema.parse({
                chainId: input.chainId,
                transactionHash: txHash,
                planHash: decisionReceipt.plan.planHash,
                kind: prepared.kind,
                status,
                blockNumber: transactionReceipt.blockNumber.toString(),
                gasUsed: transactionReceipt.gasUsed.toString(),
                confirmations,
                postConditionsPassed,
                postConditions,
                observedTimestamp,
                errorCode: status === 'UNVERIFIED' ? 'POSTCONDITION_MISMATCH' : status === 'FAILED' ? 'TRANSACTION_REVERTED' : undefined,
                errorMessage: status === 'UNVERIFIED' ? 'The transaction exists but does not fully match the prepared plan or expected state.' : undefined,
            });
            decisionReceipt.verifications.push(verification);
            if (status === 'SUCCESS' && prepared.kind === 'APPROVAL') {
                decisionReceipt.approval = { mode: 'wallet_signature', transactionHash: txHash, approvedAt: observedTimestamp };
                decisionReceipt.stage = 'APPROVAL_VERIFIED';
                decisionReceipt.preparedTransaction = undefined;
                decisionReceipt.simulation = undefined;
            }
            else if (status === 'SUCCESS') {
                decisionReceipt.stage = 'EXECUTED';
                decisionReceipt.preparedTransaction = undefined;
            }
            else if (status === 'FAILED') {
                decisionReceipt.stage = 'FAILED';
                decisionReceipt.preparedTransaction = undefined;
            }
            decisionReceipt = refreshReceiptHash(decisionReceipt);
            this.receiptRepository.save(decisionReceipt);
            return verification;
        }
        catch (error) {
            context.logger.warn(`Transaction verification did not find final evidence for plan ${decisionReceipt.plan.planId}`);
            return ExecutionVerificationSchema.parse({
                chainId: input.chainId,
                transactionHash: input.transactionHash,
                planHash: decisionReceipt.plan.planHash,
                kind: prepared.kind,
                status: 'PENDING',
                confirmations: 0,
                postConditionsPassed: false,
                postConditions: [],
                observedTimestamp,
                errorCode: 'RECEIPT_NOT_FINAL',
                errorMessage: sanitizeError(error),
            });
        }
    }
    async getReceipt(input, _context) {
        return this.requireReceipt(input.idOrHash);
    }
    async monitorCheck(input, _context) {
        const receipt = this.requireReceipt(input.planHash);
        const opportunities = z.array(OpportunitySchema).parse(input.currentOpportunities);
        const selected = opportunities.find((opportunity) => opportunity.id === receipt.plan.selectedOpportunityId);
        const triggers = [];
        if (!selected || selected.status !== 'LIVE') {
            triggers.push({ code: 'SELECTED_ADAPTER_UNAVAILABLE', reason: 'The selected opportunity is no longer live in the latest scan.' });
        }
        else {
            if (selected.riskScore > receipt.policy.maxRiskScore)
                triggers.push({ code: 'RISK_LIMIT_EXCEEDED', reason: `Current risk ${selected.riskScore} exceeds policy maximum ${receipt.policy.maxRiskScore}.` });
            if ((Date.now() - Date.parse(selected.provenance.timestamp)) / 1000 > receipt.policy.maxDataAgeSeconds)
                triggers.push({ code: 'DATA_STALE', reason: 'The selected opportunity data is stale.' });
        }
        const bestAlternative = opportunities
            .filter((opportunity) => opportunity.status === 'LIVE'
            && receipt.policy.allowedChainIds.includes(opportunity.chainId)
            && receipt.policy.allowedProtocols.includes(opportunity.protocolId)
            && opportunity.riskScore <= receipt.policy.maxRiskScore)
            .sort((a, b) => b.apyBps - a.apyBps || a.id.localeCompare(b.id))[0];
        const horizonImprovementBps = selected && bestAlternative
            ? Math.round((bestAlternative.apyBps - selected.apyBps) * receipt.policy.horizonDays / 365)
            : 0;
        if (selected && bestAlternative && bestAlternative.id !== selected.id
            && horizonImprovementBps >= receipt.policy.improvementThresholdBps) {
            triggers.push({ code: 'BETTER_ELIGIBLE_OPPORTUNITY', reason: `${bestAlternative.name} improves expected yield over the ${receipt.policy.horizonDays}-day horizon by ${horizonImprovementBps} bps.` });
        }
        const status = triggers.length > 0 ? 'REBALANCE_RECOMMENDED' : selected ? 'HEALTHY' : 'DATA_UNAVAILABLE';
        return MonitorResultSchema.parse({
            planHash: receipt.plan.planHash,
            status,
            triggers,
            selectedOpportunityId: receipt.plan.selectedOpportunityId,
            proposedFollowUp: status === 'REBALANCE_RECOMMENDED'
                ? `Create a fresh snapshot, rescan opportunities, and build a new plan for wallet ${receipt.walletAddress}. Require a new simulation and wallet signature.`
                : 'No action is required. Continue monitoring without automatic execution.',
            observedAt: new Date().toISOString(),
        });
    }
    requireReceipt(idOrHash) {
        const receipt = this.receiptRepository.get(idOrHash);
        if (!receipt)
            throw new Error(`Decision Receipt not found: ${idOrHash}`);
        return DecisionReceiptSchema.parse(receipt);
    }
    validateStoredPlan(receipt) {
        const planHash = hashWithout(receipt.plan, 'planHash');
        if (planHash !== receipt.plan.planHash)
            throw new Error('Stored plan hash mismatch.');
        if (canonicalHash(receipt.policy) !== receipt.plan.policyHash || receipt.policyHash !== receipt.plan.policyHash)
            throw new Error('Stored policy hash mismatch.');
        if (receipt.snapshot.snapshotHash !== receipt.plan.snapshotHash)
            throw new Error('Stored snapshot hash mismatch.');
        if (canonicalHash(receipt.opportunities) !== receipt.plan.opportunitySetHash)
            throw new Error('Stored opportunity-set hash mismatch.');
        if (!this.configService.isTrustedTarget(receipt.plan.protocolId, receipt.plan.chainId, receipt.plan.targetContract))
            throw new Error('Stored target is not currently allowlisted.');
    }
    async simulateProtocolAction(client, plan, amount) {
        const account = plan.walletAddress;
        const target = plan.targetContract;
        const asset = plan.assetAddress;
        if (plan.protocolId === 'aave-v3') {
            await client.simulateContract({ address: target, abi: AAVE_POOL_ABI, functionName: 'supply', args: [asset, amount, account, 0], account });
            const gas = await client.estimateContractGas({ address: target, abi: AAVE_POOL_ABI, functionName: 'supply', args: [asset, amount, account, 0], account });
            return {
                kind: 'ACTION', chainId: plan.chainId, from: plan.walletAddress, to: target,
                data: encodeFunctionData({ abi: AAVE_POOL_ABI, functionName: 'supply', args: [asset, amount, account, 0] }),
                value: '0', gasLimit: applyGasBuffer(gas).toString(), description: `Supply ${plan.deployAmount} USDC to allowlisted Aave V3.`,
            };
        }
        if (plan.protocolId === 'demo-erc4626') {
            await client.simulateContract({ address: target, abi: ERC4626_ABI, functionName: 'deposit', args: [amount, account], account });
            const gas = await client.estimateContractGas({ address: target, abi: ERC4626_ABI, functionName: 'deposit', args: [amount, account], account });
            return {
                kind: 'ACTION', chainId: plan.chainId, from: plan.walletAddress, to: target,
                data: encodeFunctionData({ abi: ERC4626_ABI, functionName: 'deposit', args: [amount, account] }),
                value: '0', gasLimit: applyGasBuffer(gas).toString(), description: `Deposit ${plan.deployAmount} USDC into the allowlisted controlled ERC-4626 vault.`,
            };
        }
        throw new Error(`No executable adapter exists for protocol ${plan.protocolId}.`);
    }
};
__decorate([
    Tool({
        name: 'strategy_createPlan',
        title: 'Build a policy-bounded treasury plan',
        description: 'Validate a server-produced wallet snapshot and opportunity set, apply deterministic hard gates before ranking, include the liquid baseline, and create a short-lived typed plan. Caller-provided addresses never become trusted execution targets.',
        inputSchema: CreatePlanInputSchema,
        outputSchema: DecisionReceiptSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
        invocation: { invoking: 'Applying policy and ranking candidates…', invoked: 'Policy-bounded plan created' },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], PlanningTools.prototype, "createPlan", null);
__decorate([
    Tool({
        name: 'plan_simulate',
        title: 'Simulate the next bounded wallet action',
        description: 'Revalidate a stored plan and trusted adapter against live chain state. If allowance is insufficient, safely simulate and return only an exact approval transaction; otherwise simulate the protocol action and expected postconditions.',
        inputSchema: z.object({ planHash: ContentHashSchema }).strict(),
        outputSchema: SimulationResultSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
        invocation: { invoking: 'Simulating against live testnet state…', invoked: 'Simulation finished' },
    }),
    RateLimit({ requests: 20, window: '1m', message: 'Simulations are limited to protect free public RPC capacity.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlanningTools.prototype, "simulatePlan", null);
__decorate([
    Tool({
        name: 'execution_prepare',
        title: 'Prepare the simulated wallet transaction',
        description: 'Return only the exact unsigned transaction produced by the latest non-expired simulation. The server does not sign or submit it and never accepts caller-provided targets or calldata.',
        inputSchema: z.object({ planHash: ContentHashSchema }).strict(),
        outputSchema: PreparedTransactionSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        invocation: { invoking: 'Revalidating the simulated transaction…', invoked: 'Unsigned wallet transaction prepared' },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlanningTools.prototype, "prepareExecution", null);
__decorate([
    Tool({
        name: 'execution_verify',
        title: 'Verify the signed testnet transaction',
        description: 'Read the live transaction and receipt, prove that sender, target, calldata, value, chain, and postconditions match the prepared plan, and never report success without on-chain evidence.',
        inputSchema: z.object({
            chainId: ChainIdSchema,
            transactionHash: TransactionHashSchema,
            planHash: ContentHashSchema,
        }).strict(),
        outputSchema: ExecutionVerificationSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
        invocation: { invoking: 'Verifying transaction and postconditions on-chain…', invoked: 'Verification complete' },
    }),
    RateLimit({ requests: 30, window: '1m', message: 'Verification reads are limited to protect free public RPC capacity.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlanningTools.prototype, "verifyExecution", null);
__decorate([
    Tool({
        name: 'receipt_get',
        title: 'Read the Decision Receipt',
        description: 'Retrieve the complete validated Decision Receipt by receipt ID or plan hash. Receipts persist across restarts only when the optional local hackathon store is configured.',
        inputSchema: z.object({ idOrHash: z.string().min(1).max(100) }).strict(),
        outputSchema: DecisionReceiptSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        invocation: { invoking: 'Loading the Decision Receipt…', invoked: 'Decision Receipt loaded' },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlanningTools.prototype, "getReceipt", null);
__decorate([
    Tool({
        name: 'monitor_check',
        title: 'Check whether a rebalance should be proposed',
        description: 'Compare a stored executed/planned decision with a fresh validated opportunity scan. It can recommend a new proposal but never moves funds automatically.',
        inputSchema: z.object({
            planHash: ContentHashSchema,
            currentOpportunities: z.array(OpportunitySchema).min(1).max(50),
        }).strict(),
        outputSchema: MonitorResultSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlanningTools.prototype, "monitorCheck", null);
PlanningTools = __decorate([
    Injectable({ deps: [ReceiptRepository, ProofYieldConfigService, EvidenceRepository] }),
    __metadata("design:paramtypes", [ReceiptRepository,
        ProofYieldConfigService,
        EvidenceRepository])
], PlanningTools);
export { PlanningTools };
function scoreOpportunity(opportunity, policy) {
    const yieldBenefit = Math.round(opportunity.apyBps * policy.horizonDays / 365);
    const gasPenalty = 4;
    const protocolRiskPenalty = Math.round(opportunity.riskScore * 0.4);
    const liquidityPenalty = Number(opportunity.liquidity) <= 0 ? 100 : 0;
    const deploymentPct = Math.min(100 - policy.keepLiquidMinPct, policy.maxProtocolPct);
    const concentrationPenalty = Math.round(Math.max(0, deploymentPct - 50) * 0.4);
    const uncertaintyPenalty = opportunity.provenance.dataMode === 'SIMULATED' ? 5 : 0;
    return {
        netScore: yieldBenefit - gasPenalty - protocolRiskPenalty - liquidityPenalty - concentrationPenalty - uncertaintyPenalty,
        yieldBenefit,
        gasPenalty,
        protocolRiskPenalty,
        liquidityPenalty,
        concentrationPenalty,
        uncertaintyPenalty,
    };
}
function zeroScore() {
    return { netScore: 0, yieldBenefit: 0, gasPenalty: 0, protocolRiskPenalty: 0, liquidityPenalty: 0, concentrationPenalty: 0, uncertaintyPenalty: 0 };
}
function ensureDoNothingCandidate(opportunities, snapshot, policy) {
    if (opportunities.some((opportunity) => opportunity.protocolId === 'do-nothing'
        && opportunity.provenance.sourceId === 'proofyield-policy-baseline'))
        return opportunities;
    const chain = snapshot.chains.find((item) => item.status === 'LIVE' && policy.allowedChainIds.includes(item.chainId));
    if (!chain)
        return opportunities;
    const asset = chain.assets.find((item) => item.symbol === 'USDC');
    if (!asset)
        return opportunities;
    const baseline = OpportunitySchema.parse({
        id: `do-nothing-${chain.chainId}`,
        name: `Keep USDC liquid (${chain.chainName})`,
        protocolId: 'do-nothing',
        chainId: chain.chainId,
        assetSymbol: 'USDC',
        assetAddress: asset?.address,
        apyBps: 0,
        liquidity: '999999999999999999',
        riskScore: 0,
        withdrawalKnown: true,
        rateLabel: 'BASELINE',
        provenance: {
            chainId: chain.chainId,
            blockNumber: chain.blockNumber ?? '0',
            timestamp: new Date().toISOString(),
            sourceId: 'proofyield-policy-baseline',
            adapterVersion: '1.1.0',
            dataMode: 'SYSTEM',
            confidence: 'HIGH',
        },
        status: 'LIVE',
    });
    return [...opportunities, baseline];
}
function percentage(amount, pct) {
    return amount * BigInt(pct) / 100n;
}
function minBigInt(a, b) {
    return a < b ? a : b;
}
function applyGasBuffer(gas) {
    return gas * 120n / 100n;
}
function finalizeSimulation(value) {
    const draft = { ...value, simulationHash: `0x${'0'.repeat(64)}` };
    draft.simulationHash = hashWithout(draft, 'simulationHash');
    return SimulationResultSchema.parse(draft);
}
function sanitizeError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.replace(/https?:\/\/\S+/g, '[redacted endpoint]').slice(0, 300);
}
//# sourceMappingURL=planning.tools.js.map