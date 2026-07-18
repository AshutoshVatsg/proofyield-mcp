var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Injectable } from '@nitrostack/core';
import { DecisionReceiptSchema } from './schemas.js';
/**
 * Small hackathon receipt store. Set PROOFYIELD_RECEIPT_STORE_PATH to retain
 * receipts across restarts; leave it unset for an in-memory, zero-write server.
 * A production deployment should replace this with a user-scoped database.
 */
let ReceiptRepository = class ReceiptRepository {
    receiptsById = new Map();
    receiptIdByPlanHash = new Map();
    storePath = process.env.PROOFYIELD_RECEIPT_STORE_PATH
        ? resolve(process.env.PROOFYIELD_RECEIPT_STORE_PATH)
        : undefined;
    constructor() {
        this.hydrate();
    }
    save(receipt) {
        const validated = DecisionReceiptSchema.parse(structuredClone(receipt));
        this.receiptsById.set(validated.receiptId, validated);
        this.receiptIdByPlanHash.set(validated.plan.planHash, validated.receiptId);
        this.persist();
        return structuredClone(validated);
    }
    get(idOrHash) {
        const receiptId = this.receiptsById.has(idOrHash)
            ? idOrHash
            : this.receiptIdByPlanHash.get(idOrHash);
        const receipt = receiptId ? this.receiptsById.get(receiptId) : undefined;
        return receipt ? structuredClone(receipt) : undefined;
    }
    getAll() {
        return Array.from(this.receiptsById.values(), (receipt) => structuredClone(receipt));
    }
    hasVerifiedTransaction(transactionHash) {
        const normalized = transactionHash.toLowerCase();
        return Array.from(this.receiptsById.values()).some((receipt) => receipt.verifications.some((verification) => verification.transactionHash.toLowerCase() === normalized));
    }
    hydrate() {
        if (!this.storePath || !existsSync(this.storePath))
            return;
        const parsed = JSON.parse(readFileSync(this.storePath, 'utf8'));
        const receipts = DecisionReceiptSchema.array().parse(parsed);
        for (const receipt of receipts) {
            this.receiptsById.set(receipt.receiptId, receipt);
            this.receiptIdByPlanHash.set(receipt.plan.planHash, receipt.receiptId);
        }
    }
    persist() {
        if (!this.storePath)
            return;
        const directory = dirname(this.storePath);
        mkdirSync(directory, { recursive: true });
        const temporaryPath = `${this.storePath}.${process.pid}.tmp`;
        writeFileSync(temporaryPath, JSON.stringify(this.getAll(), null, 2), { encoding: 'utf8', mode: 0o600 });
        renameSync(temporaryPath, this.storePath);
    }
};
ReceiptRepository = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], ReceiptRepository);
export { ReceiptRepository };
//# sourceMappingURL=receipt.repository.js.map