import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Injectable } from '@nitrostack/core';
import { DecisionReceipt, DecisionReceiptSchema } from './schemas.js';

/**
 * Small hackathon receipt store. Set PROOFYIELD_RECEIPT_STORE_PATH to retain
 * receipts across restarts; leave it unset for an in-memory, zero-write server.
 * A production deployment should replace this with a user-scoped database.
 */
@Injectable()
export class ReceiptRepository {
  private readonly receiptsById = new Map<string, DecisionReceipt>();
  private readonly receiptIdByPlanHash = new Map<string, string>();
  private readonly storePath = process.env.PROOFYIELD_RECEIPT_STORE_PATH
    ? resolve(process.env.PROOFYIELD_RECEIPT_STORE_PATH)
    : undefined;

  constructor() {
    this.hydrate();
  }

  save(receipt: DecisionReceipt): DecisionReceipt {
    const validated = DecisionReceiptSchema.parse(structuredClone(receipt));
    this.receiptsById.set(validated.receiptId, validated);
    this.receiptIdByPlanHash.set(validated.plan.planHash, validated.receiptId);
    this.persist();
    return structuredClone(validated);
  }

  get(idOrHash: string): DecisionReceipt | undefined {
    const receiptId = this.receiptsById.has(idOrHash)
      ? idOrHash
      : this.receiptIdByPlanHash.get(idOrHash);
    const receipt = receiptId ? this.receiptsById.get(receiptId) : undefined;
    return receipt ? structuredClone(receipt) : undefined;
  }

  getAll(): DecisionReceipt[] {
    return Array.from(this.receiptsById.values(), (receipt) => structuredClone(receipt));
  }

  hasVerifiedTransaction(transactionHash: string): boolean {
    const normalized = transactionHash.toLowerCase();
    return Array.from(this.receiptsById.values()).some((receipt) =>
      receipt.verifications.some((verification) => verification.transactionHash.toLowerCase() === normalized),
    );
  }

  private hydrate(): void {
    if (!this.storePath || !existsSync(this.storePath)) return;
    const parsed: unknown = JSON.parse(readFileSync(this.storePath, 'utf8'));
    const receipts = DecisionReceiptSchema.array().parse(parsed);
    for (const receipt of receipts) {
      this.receiptsById.set(receipt.receiptId, receipt);
      this.receiptIdByPlanHash.set(receipt.plan.planHash, receipt.receiptId);
    }
  }

  private persist(): void {
    if (!this.storePath) return;
    const directory = dirname(this.storePath);
    mkdirSync(directory, { recursive: true });
    const temporaryPath = `${this.storePath}.${process.pid}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(this.getAll(), null, 2), { encoding: 'utf8', mode: 0o600 });
    renameSync(temporaryPath, this.storePath);
  }
}
