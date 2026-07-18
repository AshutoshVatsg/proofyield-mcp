import { ExecutionContext, Injectable, ResourceDecorator as Resource } from '@nitrostack/core';
import { ProofYieldConfigService } from '../shared/config.service.js';

@Injectable({ deps: [ProofYieldConfigService] })
export class DiscoveryResources {
  constructor(private readonly configService: ProofYieldConfigService) {}

  @Resource({
    uri: 'proofyield://capabilities',
    name: 'ProofYield capabilities and safety contract',
    description: 'Supported chains, configured adapters, MCP workflow, trust boundary, and testnet-only safety guarantees.',
    mimeType: 'application/json',
    annotations: { audience: ['assistant', 'user'], priority: 1 },
    metadata: { cacheable: false },
  })
  async capabilities(_context: ExecutionContext) {
    return {
      type: 'text' as const,
      text: JSON.stringify({
        application: 'ProofYield',
        environment: 'testnet-only',
        brain: {
          llmHost: 'Interprets user intent, chooses which typed MCP tools to call, and explains results.',
          deterministicCore: 'Validates schemas, policy, provenance, trusted addresses, simulations, wallet approvals, and on-chain verification.',
          privateKeys: 'Never accepted or stored by the MCP server.',
        },
        workflow: [
          'system_getStatus',
          'portfolio_getSnapshot',
          'opportunities_scan',
          'strategy_createPlan',
          'plan_simulate',
          'execution_prepare',
          'browser_wallet_sign_and_submit',
          'execution_verify',
          'receipt_get',
          'monitor_check',
        ],
        configuredChains: this.configService.getPublicConfiguration(),
        safety: [
          'Caller-supplied addresses and calldata are never trusted for execution.',
          'Every executable plan is short-lived and bound to policy, snapshot, opportunity set, chain, and wallet hashes.',
          'Exact approval is separated from protocol execution and must be verified before action simulation.',
          'No transaction is reported successful without a matching live on-chain receipt and postconditions.',
          'Monitoring proposes a rebalance and never moves funds automatically.',
        ],
      }, null, 2),
    };
  }
}
