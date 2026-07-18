import { ExecutionContext } from '@nitrostack/core';
import { ProofYieldConfigService } from '../shared/config.service.js';
import { EvidenceRepository } from '../shared/evidence.repository.js';
import { ChainId, Opportunity, WalletSnapshot } from '../shared/schemas.js';
export declare class DiscoveryTools {
    private readonly configService;
    private readonly evidenceRepository;
    constructor(configService: ProofYieldConfigService, evidenceRepository: EvidenceRepository);
    getStatus(_input: Record<string, never>, _context: ExecutionContext): Promise<{
        timestamp: string;
        application: "ProofYield";
        version: string;
        architecture: "one-server-modular-mcp";
        phase: string;
        brain: {
            reasoning: string;
            authorization: string;
        };
        supportedChains: {
            chainId: 11155111 | 84532 | 80002;
            name: string;
            rpcConfigured: boolean;
            usdcConfigured: boolean;
            adapters: {
                aaveV3: boolean;
                demoErc4626: boolean;
            };
        }[];
        tools: string[];
        schemaVersion: string;
        executionMode: "NON_CUSTODIAL_APPROVAL_REQUIRED";
    }>;
    getSnapshot(input: {
        walletAddress: string;
        chainIds?: ChainId[];
    }, context: ExecutionContext): Promise<WalletSnapshot>;
    scanOpportunities(input: {
        walletAddress: string;
        assetId: 'USDC';
        amount: string;
        allowedChainIds?: ChainId[];
    }, context: ExecutionContext): Promise<Opportunity[]>;
}
//# sourceMappingURL=discovery.tools.d.ts.map