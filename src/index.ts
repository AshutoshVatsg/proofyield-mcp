/** ProofYield MCP server entry point. Transport and authorization are
 * configured by NitroStack; this process never accepts wallet private keys. */
import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);
  await server.start();
}

bootstrap().catch((error) => {
  // Keep stdout reserved for the JSON-RPC stream in STDIO mode.
  process.stderr.write(`ProofYield failed to start: ${error?.message || error}\n`);
  process.exit(1);
});
