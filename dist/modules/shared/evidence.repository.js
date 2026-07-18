var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nitrostack/core';
import { OpportunitySchema, WalletSnapshotSchema, canonicalHash, canonicalJson, hashWithout, } from './schemas.js';
/** Process-local trust anchor for discovery output consumed by the planner. */
let EvidenceRepository = class EvidenceRepository {
    snapshots = new Map();
    opportunitySets = new Map();
    maxEntries = 100;
    saveSnapshot(value) {
        const snapshot = WalletSnapshotSchema.parse(structuredClone(value));
        if (snapshot.snapshotHash !== hashWithout(snapshot, 'snapshotHash')) {
            throw new Error('Cannot register a snapshot with an invalid content hash.');
        }
        this.snapshots.set(snapshot.snapshotHash, snapshot);
        this.trim(this.snapshots);
        return structuredClone(snapshot);
    }
    saveOpportunities(value, query) {
        const opportunities = OpportunitySchema.array().parse(structuredClone(value));
        this.opportunitySets.set(canonicalHash(opportunities), {
            values: opportunities,
            walletAddress: query.walletAddress.toLowerCase(),
            amount: query.amount,
        });
        this.trim(this.opportunitySets);
        return structuredClone(opportunities);
    }
    matchesSnapshot(value) {
        const trusted = this.snapshots.get(value.snapshotHash);
        return Boolean(trusted && canonicalJson(trusted) === canonicalJson(value));
    }
    matchesOpportunities(value, query) {
        const trusted = this.opportunitySets.get(canonicalHash(value));
        return Boolean(trusted
            && trusted.walletAddress === query.walletAddress.toLowerCase()
            && trusted.amount === query.amount
            && canonicalJson(trusted.values) === canonicalJson(value));
    }
    trim(store) {
        while (store.size > this.maxEntries) {
            const oldest = store.keys().next().value;
            if (!oldest)
                return;
            store.delete(oldest);
        }
    }
};
EvidenceRepository = __decorate([
    Injectable()
], EvidenceRepository);
export { EvidenceRepository };
//# sourceMappingURL=evidence.repository.js.map