import { ExecutionContext } from '@nitrostack/core';
export declare class DiscoveryPrompts {
    treasuryHelp(args: {
        walletAddress?: string;
        intent?: string;
    }, _context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=discovery.prompts.d.ts.map