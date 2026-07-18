import { Opportunity, WalletSnapshot } from './schemas.js';
/** Process-local trust anchor for discovery output consumed by the planner. */
export declare class EvidenceRepository {
    private readonly snapshots;
    private readonly opportunitySets;
    private readonly maxEntries;
    saveSnapshot(value: WalletSnapshot): WalletSnapshot;
    saveOpportunities(value: Opportunity[], query: {
        walletAddress: string;
        amount: string;
    }): Opportunity[];
    matchesSnapshot(value: WalletSnapshot): boolean;
    matchesOpportunities(value: Opportunity[], query: {
        walletAddress: string;
        amount: string;
    }): boolean;
    private trim;
}
//# sourceMappingURL=evidence.repository.d.ts.map