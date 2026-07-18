import { ExecutionContext } from '@nitrostack/core';
import { ProofYieldConfigService } from '../shared/config.service.js';
export declare class DiscoveryResources {
    private readonly configService;
    constructor(configService: ProofYieldConfigService);
    capabilities(_context: ExecutionContext): Promise<{
        type: "text";
        text: string;
    }>;
}
//# sourceMappingURL=discovery.resources.d.ts.map