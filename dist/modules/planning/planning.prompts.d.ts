import { ExecutionContext } from '@nitrostack/core';
/**
 * Planning Prompts
 *
 * TODO: Add description
 */
export declare class PlanningPrompts {
    helpPrompt(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=planning.prompts.d.ts.map