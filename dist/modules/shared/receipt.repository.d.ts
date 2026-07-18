import { DecisionReceipt } from './schemas.js';
/**
 * Small hackathon receipt store. Set PROOFYIELD_RECEIPT_STORE_PATH to retain
 * receipts across restarts; leave it unset for an in-memory, zero-write server.
 * A production deployment should replace this with a user-scoped database.
 */
export declare class ReceiptRepository {
    private readonly receiptsById;
    private readonly receiptIdByPlanHash;
    private readonly storePath;
    constructor();
    save(receipt: DecisionReceipt): DecisionReceipt;
    get(idOrHash: string): DecisionReceipt | undefined;
    getAll(): DecisionReceipt[];
    hasVerifiedTransaction(transactionHash: string): boolean;
    private hydrate;
    private persist;
}
//# sourceMappingURL=receipt.repository.d.ts.map