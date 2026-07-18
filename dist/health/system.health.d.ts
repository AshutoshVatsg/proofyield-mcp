import { HealthCheckInterface, HealthCheckResult } from '@nitrostack/core';
/**
 * System Health Check
 *
 * Lightweight process-liveness signal. Adapter readiness is exposed by
 * system_getStatus because a healthy process can still have unconfigured RPCs.
 */
export declare class SystemHealthCheck implements HealthCheckInterface {
    private startTime;
    constructor();
    check(): Promise<HealthCheckResult>;
}
//# sourceMappingURL=system.health.d.ts.map