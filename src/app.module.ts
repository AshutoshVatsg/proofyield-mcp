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
@McpApp({
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
})
@Module({
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
export class AppModule {}
