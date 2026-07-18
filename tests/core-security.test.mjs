import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_USER_POLICY,
  DecisionReceiptSchema,
  EvmAddressSchema,
  WalletSnapshotSchema,
  canonicalHash,
  hashWithout,
} from '../dist/modules/shared/schemas.js';
import { ReceiptRepository } from '../dist/modules/shared/receipt.repository.js';
import { PlanningTools } from '../dist/modules/planning/planning.tools.js';
import { EvidenceRepository } from '../dist/modules/shared/evidence.repository.js';

const wallet = '0x1111111111111111111111111111111111111111';
const token = '0x2222222222222222222222222222222222222222';
const vault = '0x3333333333333333333333333333333333333333';
const observedTimestamp = new Date().toISOString();

function snapshot(positions = []) {
  const draft = {
    walletAddress: wallet,
    chains: [{
      chainId: 84532,
      chainName: 'Base Sepolia',
      status: 'LIVE',
      blockNumber: '123',
      nativeBalance: '0.1',
      assets: [{ symbol: 'USDC', address: token, amount: '10', amountBaseUnits: '10000000', decimals: 6 }],
      positions,
      observedTimestamp,
      provenance: {
        chainId: 84532,
        blockNumber: '123',
        timestamp: observedTimestamp,
        sourceId: 'base-sepolia-rpc',
        adapterVersion: '1.1.0',
        dataMode: 'LIVE',
        confidence: 'HIGH',
      },
    }],
    observedTimestamp,
    snapshotHash: `0x${'0'.repeat(64)}`,
  };
  draft.snapshotHash = hashWithout(draft, 'snapshotHash');
  return WalletSnapshotSchema.parse(draft);
}

function baseline() {
  return {
    id: 'do-nothing-84532',
    name: 'Keep USDC liquid (Base Sepolia)',
    protocolId: 'do-nothing',
    chainId: 84532,
    assetSymbol: 'USDC',
    assetAddress: token,
    apyBps: 0,
    liquidity: '999999999',
    riskScore: 0,
    withdrawalKnown: true,
    rateLabel: 'BASELINE',
    provenance: {
      chainId: 84532,
      blockNumber: '123',
      timestamp: observedTimestamp,
      sourceId: 'proofyield-policy-baseline',
      adapterVersion: '1.1.0',
      dataMode: 'SYSTEM',
      confidence: 'HIGH',
    },
    status: 'LIVE',
  };
}

function controlledVault(target = vault) {
  return {
    id: 'demo-vault-84532',
    name: 'Controlled ERC-4626 Vault (Base Sepolia)',
    protocolId: 'demo-erc4626',
    chainId: 84532,
    assetSymbol: 'USDC',
    assetAddress: token,
    apyBps: 650,
    liquidity: '100',
    contractAddress: target,
    riskScore: 45,
    withdrawalKnown: true,
    rateLabel: 'CONTROLLED_SIMULATION',
    provenance: {
      chainId: 84532,
      blockNumber: '123',
      timestamp: observedTimestamp,
      sourceId: 'proofyield-controlled-demo-registry',
      adapterVersion: '1.1.0',
      contractAddress: target,
      dataMode: 'SIMULATED',
      confidence: 'MEDIUM',
    },
    status: 'LIVE',
  };
}

const context = { logger: { info() {}, warn() {}, error() {}, debug() {} } };
const unusedConfig = {
  getAdapter() { return undefined; },
  getChainConfig() { throw new Error('not needed for do-nothing'); },
  isTrustedTarget() { return false; },
};
const demoConfig = {
  getAdapter(protocolId, chainId) {
    return protocolId === 'demo-erc4626' && chainId === 84532
      ? { protocolId, chainId, assetAddress: token, targetAddress: vault, rateMode: 'CONTROLLED_SIMULATION' }
      : undefined;
  },
  getChainConfig() { throw new Error('not needed during planning'); },
  isTrustedTarget(protocolId, chainId, target) {
    return protocolId === 'demo-erc4626' && chainId === 84532 && target?.toLowerCase() === vault.toLowerCase();
  },
};

function plannerWithEvidence(config, repository = new ReceiptRepository(), amount = '5') {
  const evidence = new EvidenceRepository();
  const walletSnapshot = snapshot();
  const opportunities = [baseline()];
  evidence.saveSnapshot(walletSnapshot);
  evidence.saveOpportunities(opportunities, { walletAddress: wallet, amount });
  return { planner: new PlanningTools(repository, config, evidence), walletSnapshot, opportunities };
}

test('canonical hash is stable across key order and cryptographically sized', () => {
  const left = canonicalHash({ b: 2, a: 1 });
  const right = canonicalHash({ a: 1, b: 2 });
  assert.equal(left, right);
  assert.match(left, /^0x[0-9a-f]{64}$/);
  assert.notEqual(canonicalHash({ amount: '10' }), canonicalHash({ amount: '11' }));
});

test('strict address and snapshot schemas reject malformed evidence', () => {
  assert.equal(EvmAddressSchema.safeParse('0x1234').success, false);
  assert.equal(WalletSnapshotSchema.safeParse({ walletAddress: wallet }).success, false);
});

test('do-nothing cannot bypass the validated wallet balance', async () => {
  const { planner, walletSnapshot, opportunities } = plannerWithEvidence(unusedConfig, new ReceiptRepository(), '100');
  await assert.rejects(
    planner.createPlan({ snapshot: walletSnapshot, opportunities, amount: '100', policy: DEFAULT_USER_POLICY }, context),
    /No safe candidate exists/,
  );
});

test('valid liquid baseline produces a schema-valid, hash-bound receipt', async () => {
  const repository = new ReceiptRepository();
  const { planner, walletSnapshot, opportunities } = plannerWithEvidence(unusedConfig, repository);
  const receipt = await planner.createPlan({ snapshot: walletSnapshot, opportunities, amount: '5', policy: DEFAULT_USER_POLICY }, context);
  assert.equal(receipt.plan.actionType, 'DO_NOTHING');
  assert.equal(receipt.plan.liquidReserveAmount, '5');
  assert.equal(receipt.finalReceiptHash, hashWithout(receipt, 'finalReceiptHash'));
  assert.equal(DecisionReceiptSchema.safeParse(receipt).success, true);

  receipt.plan.requestedAmount = '9';
  assert.equal(repository.get(receipt.receiptId).plan.requestedAmount, '5');
});

test('horizon-adjusted ranking selects an eligible controlled vault', async () => {
  const evidence = new EvidenceRepository();
  const walletSnapshot = evidence.saveSnapshot(snapshot());
  const opportunities = evidence.saveOpportunities([controlledVault(), baseline()], { walletAddress: wallet, amount: '5' });
  const planner = new PlanningTools(new ReceiptRepository(), demoConfig, evidence);
  const receipt = await planner.createPlan({
    snapshot: walletSnapshot,
    opportunities,
    amount: '5',
    policy: DEFAULT_USER_POLICY,
  }, context);
  assert.equal(receipt.selectedOpportunity.protocolId, 'demo-erc4626');
  assert.equal(receipt.plan.deployAmount, '3');
  assert.ok(receipt.scoreBreakdown.netScore >= DEFAULT_USER_POLICY.improvementThresholdBps);
});

test('caller-supplied execution targets are rejected by the registry', async () => {
  const evidence = new EvidenceRepository();
  const walletSnapshot = evidence.saveSnapshot(snapshot());
  const opportunities = evidence.saveOpportunities([controlledVault('0x4444444444444444444444444444444444444444'), baseline()], { walletAddress: wallet, amount: '5' });
  const planner = new PlanningTools(new ReceiptRepository(), demoConfig, evidence);
  const receipt = await planner.createPlan({
    snapshot: walletSnapshot,
    opportunities,
    amount: '5',
    policy: DEFAULT_USER_POLICY,
  }, context);
  assert.equal(receipt.plan.actionType, 'DO_NOTHING');
  assert.ok(receipt.rejectedCandidates.some((item) => item.code === 'CONTRACT_NOT_ALLOWLISTED'));
});

test('planner rejects self-hashed evidence that discovery never issued', async () => {
  const planner = new PlanningTools(new ReceiptRepository(), unusedConfig, new EvidenceRepository());
  await assert.rejects(
    planner.createPlan({ snapshot: snapshot(), opportunities: [baseline()], amount: '5', policy: DEFAULT_USER_POLICY }, context),
    /not issued by this ProofYield server/,
  );
});

test('opportunity evidence is bound to the researched wallet and amount', async () => {
  const evidence = new EvidenceRepository();
  const walletSnapshot = evidence.saveSnapshot(snapshot());
  const opportunities = evidence.saveOpportunities([baseline()], { walletAddress: wallet, amount: '1' });
  const planner = new PlanningTools(new ReceiptRepository(), unusedConfig, evidence);
  await assert.rejects(
    planner.createPlan({ snapshot: walletSnapshot, opportunities, amount: '5', policy: DEFAULT_USER_POLICY }, context),
    /not issued for this wallet and amount/,
  );
});

test('existing positions reduce remaining protocol concentration capacity', async () => {
  const existingPosition = {
    protocolId: 'demo-erc4626',
    chainId: 84532,
    assetSymbol: 'USDC',
    amount: '10',
    contractAddress: vault,
    provenance: {
      chainId: 84532,
      blockNumber: '123',
      timestamp: observedTimestamp,
      sourceId: 'erc4626-share-conversion',
      adapterVersion: '1.1.0',
      contractAddress: vault,
      dataMode: 'LIVE',
      confidence: 'HIGH',
    },
  };
  const evidence = new EvidenceRepository();
  const walletSnapshot = evidence.saveSnapshot(snapshot([existingPosition]));
  const opportunities = evidence.saveOpportunities([controlledVault(), baseline()], { walletAddress: wallet, amount: '5' });
  const planner = new PlanningTools(new ReceiptRepository(), demoConfig, evidence);
  const receipt = await planner.createPlan({ snapshot: walletSnapshot, opportunities, amount: '5', policy: DEFAULT_USER_POLICY }, context);
  assert.equal(receipt.plan.deployAmount, '2');
  assert.equal(receipt.plan.liquidReserveAmount, '3');
});
