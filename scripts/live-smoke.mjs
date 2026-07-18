import 'dotenv/config';
import { ProofYieldConfigService } from '../dist/modules/shared/config.service.js';
import { DiscoveryTools } from '../dist/modules/discovery/discovery.tools.js';
import { EvidenceRepository } from '../dist/modules/shared/evidence.repository.js';

const walletAddress = process.env.SMOKE_WALLET_ADDRESS
  || '0x000000000000000000000000000000000000dEaD';
const config = new ProofYieldConfigService({ get: (key) => process.env[key] });
const configuredChains = config.getAllChainConfigs().filter((chain) => chain.rpcUrl && chain.usdcAddress);

if (configuredChains.length === 0) {
  process.stderr.write('No chain has both RPC and test-USDC configured.\n');
  process.exitCode = 1;
} else {
  const logger = { info() {}, debug() {}, warn(message) { process.stderr.write(`${message}\n`); }, error(message) { process.stderr.write(`${message}\n`); } };
  const tools = new DiscoveryTools(config, new EvidenceRepository());
  const chainIds = configuredChains.map((chain) => chain.chainId);
  const snapshot = await tools.getSnapshot({ walletAddress, chainIds }, { logger });
  const opportunities = await tools.scanOpportunities({ walletAddress, assetId: 'USDC', amount: '1', allowedChainIds: chainIds }, { logger });
  const summary = {
    walletAddress,
    chains: snapshot.chains.map((chain) => ({
      chainId: chain.chainId,
      status: chain.status,
      blockNumber: chain.blockNumber,
      usdcBalance: chain.assets.find((asset) => asset.symbol === 'USDC')?.amount,
      errorCode: chain.errorCode,
    })),
    opportunities: opportunities.map((opportunity) => ({
      id: opportunity.id,
      status: opportunity.status,
      rateLabel: opportunity.rateLabel,
      blockNumber: opportunity.provenance.blockNumber,
    })),
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (snapshot.chains.some((chain) => chain.status !== 'LIVE')) process.exitCode = 1;
}

// NitroStack decorators initialize background telemetry handles; a CLI smoke
// check must terminate explicitly after reporting its deterministic result.
process.exit(process.exitCode ?? 0);
