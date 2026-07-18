import { Injectable } from '@nitrostack/core';
import {
  Opportunity,
  OpportunitySchema,
  WalletSnapshot,
  WalletSnapshotSchema,
  canonicalHash,
  canonicalJson,
  hashWithout,
} from './schemas.js';

/** Process-local trust anchor for discovery output consumed by the planner. */
@Injectable()
export class EvidenceRepository {
  private readonly snapshots = new Map<string, WalletSnapshot>();
  private readonly opportunitySets = new Map<string, { values: Opportunity[]; walletAddress: string; amount: string }>();
  private readonly maxEntries = 100;

  saveSnapshot(value: WalletSnapshot): WalletSnapshot {
    const snapshot = WalletSnapshotSchema.parse(structuredClone(value));
    if (snapshot.snapshotHash !== hashWithout(snapshot as unknown as Record<string, unknown>, 'snapshotHash')) {
      throw new Error('Cannot register a snapshot with an invalid content hash.');
    }
    this.snapshots.set(snapshot.snapshotHash, snapshot);
    this.trim(this.snapshots);
    return structuredClone(snapshot);
  }

  saveOpportunities(value: Opportunity[], query: { walletAddress: string; amount: string }): Opportunity[] {
    const opportunities = OpportunitySchema.array().parse(structuredClone(value));
    this.opportunitySets.set(canonicalHash(opportunities), {
      values: opportunities,
      walletAddress: query.walletAddress.toLowerCase(),
      amount: query.amount,
    });
    this.trim(this.opportunitySets);
    return structuredClone(opportunities);
  }

  matchesSnapshot(value: WalletSnapshot): boolean {
    const trusted = this.snapshots.get(value.snapshotHash);
    return Boolean(trusted && canonicalJson(trusted) === canonicalJson(value));
  }

  matchesOpportunities(value: Opportunity[], query: { walletAddress: string; amount: string }): boolean {
    const trusted = this.opportunitySets.get(canonicalHash(value));
    return Boolean(
      trusted
      && trusted.walletAddress === query.walletAddress.toLowerCase()
      && trusted.amount === query.amount
      && canonicalJson(trusted.values) === canonicalJson(value),
    );
  }

  private trim<T>(store: Map<string, T>): void {
    while (store.size > this.maxEntries) {
      const oldest = store.keys().next().value as string | undefined;
      if (!oldest) return;
      store.delete(oldest);
    }
  }
}
