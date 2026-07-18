var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ResourceDecorator as Resource } from '@nitrostack/core';
import { ProofYieldConfigService } from '../shared/config.service.js';
let DiscoveryResources = class DiscoveryResources {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async capabilities(_context) {
        return {
            type: 'text',
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
};
__decorate([
    Resource({
        uri: 'proofyield://capabilities',
        name: 'ProofYield capabilities and safety contract',
        description: 'Supported chains, configured adapters, MCP workflow, trust boundary, and testnet-only safety guarantees.',
        mimeType: 'application/json',
        annotations: { audience: ['assistant', 'user'], priority: 1 },
        metadata: { cacheable: false },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiscoveryResources.prototype, "capabilities", null);
DiscoveryResources = __decorate([
    Injectable({ deps: [ProofYieldConfigService] }),
    __metadata("design:paramtypes", [ProofYieldConfigService])
], DiscoveryResources);
export { DiscoveryResources };
//# sourceMappingURL=discovery.resources.js.map