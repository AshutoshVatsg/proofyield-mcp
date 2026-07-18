var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { DiscoveryModule } from './modules/discovery/discovery.module.js';
import { PlanningModule } from './modules/planning/planning.module.js';
import { SystemHealthCheck } from './health/system.health.js';
/**
 * Root Application Module
 *
 * This is the main module that bootstraps the MCP server.
 * It registers all feature modules and health checks.
 */
let AppModule = class AppModule {
};
AppModule = __decorate([
    McpApp({
        module: AppModule,
        server: {
            name: 'proofyield-server',
            version: '1.1.0'
        },
        logging: {
            level: 'info'
        },
        transport: {
            // NitroStudio uses STDIO; the standalone browser dashboard uses the
            // localhost Streamable HTTP endpoint so MetaMask and MCP coexist.
            type: 'dual',
            http: {
                port: 3000,
                host: 'localhost',
                basePath: '/mcp'
            }
        }
    }),
    Module({
        name: 'app',
        description: 'Policy-bounded testnet treasury research and execution server',
        imports: [
            ConfigModule.forRoot(),
            DiscoveryModule,
            PlanningModule
        ],
        providers: [
            // Health Checks
            SystemHealthCheck,
        ]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map