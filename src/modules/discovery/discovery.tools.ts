import {
  Cache,
  ExecutionContext,
  Injectable,
  RateLimit,
  ToolDecorator as Tool,
  Widget,
  z,
} from '@nitrostack/core';
import {
  createPublicClient,
  formatUnits,
  http,
  isAddress,
} from 'viem';
import { ProofYieldConfigService } from '../shared/config.service.js';
import { EvidenceRepository } from '../shared/evidence.repository.js';
import {
  ChainId,
  ChainIdSchema,
  ChainWalletResult,
  ChainWalletResultSchema,
  EvmAddressSchema,
  Opportunity,
  OpportunitySchema,
  SUPPORTED_CHAIN_IDS,
  WalletSnapshot,
  WalletSnapshotSchema,
  hashWithout,
} from '../shared/schemas.js';

const ERC20_ABI = [
  {
    type: 'function',
    stateMutability: 'view',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: 'decimals', type: 'uint8' }],
  },
] as const;

const AAVE_DATA_PROVIDER_ABI = [
  {
    type: 'function',
    stateMutability: 'view',
    name: 'getReserveData',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { name: 'unbacked', type: 'uint256' },
      { name: 'accruedToTreasuryScaled', type: 'uint256' },
      { name: 'totalAToken', type: 'uint256' },
      { name: 'totalStableDebt', type: 'uint256' },
      { name: 'totalVariableDebt', type: 'uint256' },
      { name: 'liquidityRate', type: 'uint256' },
      { name: 'variableBorrowRate', type: 'uint256' },
      { name: 'stableBorrowRate', type: 'uint256' },
      { name: 'averageStableBorrowRate', type: 'uint256' },
      { name: 'liquidityIndex', type: 'uint256' },
      { name: 'variableBorrowIndex', type: 'uint256' },
      { name: 'lastUpdateTimestamp', type: 'uint40' },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'getReserveTokensAddresses',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { name: 'aTokenAddress', type: 'address' },
      { name: 'stableDebtTokenAddress', type: 'address' },
      { name: 'variableDebtTokenAddress', type: 'address' },
    ],
  },
] as const;

const ERC4626_ABI = [
  {
    type: 'function',
    stateMutability: 'view',
    name: 'asset',
    inputs: [],
    outputs: [{ name: 'assetTokenAddress', type: 'address' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'totalAssets',
    inputs: [],
    outputs: [{ name: 'totalManagedAssets', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'maxDeposit',
    inputs: [{ name: 'receiver', type: 'address' }],
    outputs: [{ name: 'maxAssets', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'maxRedeem',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'maxShares', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'convertToAssets',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
] as const;

const SystemStatusSchema = z.object({
  application: z.literal('ProofYield'),
  version: z.string(),
  architecture: z.literal('one-server-modular-mcp'),
  phase: z.string(),
  brain: z.object({
    reasoning: z.string(),
    authorization: z.string(),
  }).strict(),
  supportedChains: z.array(z.object({
    chainId: ChainIdSchema,
    name: z.string(),
    rpcConfigured: z.boolean(),
    usdcConfigured: z.boolean(),
    adapters: z.object({ aaveV3: z.boolean(), demoErc4626: z.boolean() }).strict(),
  }).strict()),
  tools: z.array(z.string()),
  schemaVersion: z.string(),
  executionMode: z.literal('NON_CUSTODIAL_APPROVAL_REQUIRED'),
  timestamp: z.string().datetime({ offset: true }),
}).strict();

@Injectable({ deps: [ProofYieldConfigService, EvidenceRepository] })
export class DiscoveryTools {
  constructor(
    private readonly configService: ProofYieldConfigService,
    private readonly evidenceRepository: EvidenceRepository,
  ) {}

  @Tool({
    name: 'system_getStatus',
    title: 'Open ProofYield',
    description: 'Open the ProofYield treasury dashboard and report public configuration. The connected MCP host LLM is the reasoning brain; deterministic ProofYield code authorizes every financial action.',
    inputSchema: z.object({}).strict(),
    outputSchema: SystemStatusSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    invocation: { invoking: 'Opening ProofYield…', invoked: 'ProofYield is ready' },
  })
  @Widget({
    route: 'proofyield-dashboard',
    prefersBorder: false,
    csp: { connectDomains: [], resourceDomains: [] },
  })
  @Cache({ ttl: 15 })
  async getStatus(_input: Record<string, never>, _context: ExecutionContext) {
    return SystemStatusSchema.parse({
      application: 'ProofYield',
      version: '1.1.0',
      architecture: 'one-server-modular-mcp',
      phase: 'Hackathon MVP — safe planning and testnet execution',
      brain: {
        reasoning: 'The MCP host LLM interprets intent and orchestrates typed tools.',
        authorization: 'Deterministic policy, registry, simulation, wallet approval, and verification code decide what may execute.',
      },
      supportedChains: this.configService.getPublicConfiguration(),
      tools: [
        'system_getStatus',
        'portfolio_getSnapshot',
        'opportunities_scan',
        'strategy_createPlan',
        'plan_simulate',
        'execution_prepare',
        'execution_verify',
        'receipt_get',
        'monitor_check',
      ],
      schemaVersion: '1.1.0',
      executionMode: 'NON_CUSTODIAL_APPROVAL_REQUIRED',
      timestamp: new Date().toISOString(),
    });
  }

  @Tool({
    name: 'portfolio_getSnapshot',
    title: 'Read testnet portfolio',
    description: 'Read live native and configured test-USDC balances for a validated wallet on supported testnets. Returns per-chain failures without fabricating balances.',
    inputSchema: z.object({
      walletAddress: EvmAddressSchema.describe('EVM wallet address to inspect'),
      chainIds: z.array(ChainIdSchema).min(1).max(3).optional(),
    }).strict(),
    outputSchema: WalletSnapshotSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    invocation: { invoking: 'Reading testnet balances…', invoked: 'Portfolio snapshot captured' },
  })
  @RateLimit({ requests: 30, window: '1m', message: 'Portfolio reads are limited to protect free public RPC capacity.' })
  async getSnapshot(
    input: { walletAddress: string; chainIds?: ChainId[] },
    context: ExecutionContext,
  ): Promise<WalletSnapshot> {
    if (!isAddress(input.walletAddress)) throw new Error('Invalid EVM wallet address');
    const walletAddress = EvmAddressSchema.parse(input.walletAddress) as `0x${string}`;
    const chainIds = input.chainIds ?? [...SUPPORTED_CHAIN_IDS];
    const observedTimestamp = new Date().toISOString();

    const chains = await Promise.all(chainIds.map(async (chainId): Promise<ChainWalletResult> => {
      const config = this.configService.getChainConfig(chainId);
      if (!config.rpcUrl) {
        return ChainWalletResultSchemaCompat({
          chainId,
          chainName: config.name,
          status: 'NOT_CONFIGURED',
          assets: [],
          positions: [],
          observedTimestamp,
          errorCode: 'RPC_NOT_CONFIGURED',
          errorMessage: 'Set the chain RPC URL to enable live reads.',
        });
      }

      try {
        const client = createPublicClient({ transport: http(config.rpcUrl, { timeout: 8_000, retryCount: 1 }) });
        const [rpcChainId, blockNumberValue, nativeBalanceValue] = await Promise.all([
          client.getChainId(),
          client.getBlockNumber(),
          client.getBalance({ address: walletAddress }),
        ]);
        if (rpcChainId !== config.chainId) throw new Error(`RPC_CHAIN_MISMATCH:${rpcChainId}`);
        const blockNumber = blockNumberValue.toString();
        const assets: ChainWalletResult['assets'] = [];
        const positions: ChainWalletResult['positions'] = [];
        let errorCode: string | undefined;
        let errorMessage: string | undefined;

        if (config.usdcAddress && isAddress(config.usdcAddress)) {
          try {
            const tokenAddress = config.usdcAddress as `0x${string}`;
            const [balance, decimals] = await Promise.all([
              client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'balanceOf', args: [walletAddress] }),
              client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'decimals' }),
            ]);
            assets.push({
              symbol: 'USDC',
              address: tokenAddress,
              amount: formatUnits(balance, decimals),
              amountBaseUnits: balance.toString(),
              decimals,
            });
          } catch (error) {
            errorCode = 'USDC_READ_FAILED';
            errorMessage = sanitizeError(error);
            context.logger.warn(`USDC read failed on chain ${chainId}`);
          }
        } else {
          errorCode = 'USDC_NOT_CONFIGURED';
          errorMessage = 'Set a validated test-USDC address to read the token balance.';
        }

        const usdc = assets.find((asset) => asset.symbol === 'USDC');
        if (usdc) {
          const markPositionPartial = (protocolId: string) => {
            errorCode ??= 'POSITION_READ_PARTIAL';
            errorMessage ??= 'One configured protocol position could not be read; planning continues only with returned evidence.';
            context.logger.warn(`Position read failed for ${protocolId} on chain ${chainId}`);
          };

          const aaveAdapter = this.configService.getAdapter('aave-v3', chainId);
          if (aaveAdapter?.dataProviderAddress) {
            try {
              const reserveTokens = await client.readContract({
                address: aaveAdapter.dataProviderAddress,
                abi: AAVE_DATA_PROVIDER_ABI,
                functionName: 'getReserveTokensAddresses',
                args: [aaveAdapter.assetAddress],
              });
              const suppliedBalance = await client.readContract({
                address: reserveTokens[0],
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [walletAddress],
              });
              if (suppliedBalance > 0n) positions.push({
                protocolId: 'aave-v3',
                chainId,
                assetSymbol: 'USDC',
                amount: formatUnits(suppliedBalance, usdc.decimals),
                contractAddress: aaveAdapter.targetAddress,
                provenance: {
                  chainId,
                  blockNumber,
                  timestamp: observedTimestamp,
                  sourceId: 'aave-v3-a-token-balance',
                  adapterVersion: '1.1.0',
                  contractAddress: reserveTokens[0],
                  dataMode: 'LIVE',
                  confidence: 'HIGH',
                },
              });
            } catch {
              markPositionPartial('aave-v3');
            }
          }

          const vaultAdapter = this.configService.getAdapter('demo-erc4626', chainId);
          if (vaultAdapter) {
            try {
              const shares = await client.readContract({
                address: vaultAdapter.targetAddress,
                abi: ERC4626_ABI,
                functionName: 'balanceOf',
                args: [walletAddress],
              });
              if (shares > 0n) {
                const positionAssets = await client.readContract({
                  address: vaultAdapter.targetAddress,
                  abi: ERC4626_ABI,
                  functionName: 'convertToAssets',
                  args: [shares],
                });
                positions.push({
                  protocolId: 'demo-erc4626',
                  chainId,
                  assetSymbol: 'USDC',
                  amount: formatUnits(positionAssets, usdc.decimals),
                  contractAddress: vaultAdapter.targetAddress,
                  provenance: {
                    chainId,
                    blockNumber,
                    timestamp: observedTimestamp,
                    sourceId: 'erc4626-share-conversion',
                    adapterVersion: '1.1.0',
                    contractAddress: vaultAdapter.targetAddress,
                    dataMode: 'LIVE',
                    confidence: 'HIGH',
                  },
                });
              }
            } catch {
              markPositionPartial('demo-erc4626');
            }
          }
        }

        return ChainWalletResultSchemaCompat({
          chainId,
          chainName: config.name,
          status: 'LIVE',
          blockNumber,
          nativeBalance: formatUnits(nativeBalanceValue, 18),
          assets,
          positions,
          observedTimestamp,
          provenance: {
            chainId,
            blockNumber,
            timestamp: observedTimestamp,
            sourceId: 'evm-json-rpc',
            adapterVersion: '1.1.0',
            dataMode: 'LIVE',
            confidence: 'HIGH',
          },
          errorCode,
          errorMessage,
        });
      } catch (error) {
        context.logger.warn(`RPC read failed on chain ${chainId}`);
        return ChainWalletResultSchemaCompat({
          chainId,
          chainName: config.name,
          status: 'ERROR',
          assets: [],
          positions: [],
          observedTimestamp,
          errorCode: 'RPC_UNREACHABLE',
          errorMessage: sanitizeError(error),
        });
      }
    }));

    const draft = {
      walletAddress,
      chains,
      observedTimestamp,
      snapshotHash: `0x${'0'.repeat(64)}`,
    } as WalletSnapshot;
    draft.snapshotHash = hashWithout(draft as unknown as Record<string, unknown>, 'snapshotHash');
    return this.evidenceRepository.saveSnapshot(WalletSnapshotSchema.parse(draft));
  }

  @Tool({
    name: 'opportunities_scan',
    title: 'Research approved yield opportunities',
    description: 'Query only configured allowlisted adapters for test-USDC opportunities. Live Aave rates are read on-chain; controlled vault rates are explicitly labeled simulated; DO_NOTHING is always included.',
    inputSchema: z.object({
      walletAddress: EvmAddressSchema,
      assetId: z.literal('USDC'),
      amount: z.string().regex(/^(0|[1-9]\d*)(\.\d{1,18})?$/),
      allowedChainIds: z.array(ChainIdSchema).min(1).max(3).optional(),
    }).strict(),
    outputSchema: z.array(OpportunitySchema),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    invocation: { invoking: 'Researching allowlisted testnet opportunities…', invoked: 'Opportunity research complete' },
  })
  @RateLimit({ requests: 20, window: '1m', message: 'Opportunity scans are limited to protect free public RPC capacity.' })
  async scanOpportunities(
    input: { walletAddress: string; assetId: 'USDC'; amount: string; allowedChainIds?: ChainId[] },
    context: ExecutionContext,
  ): Promise<Opportunity[]> {
    if (!isAddress(input.walletAddress)) throw new Error('Invalid EVM wallet address');
    const chainIds = input.allowedChainIds ?? [...SUPPORTED_CHAIN_IDS];
    const opportunities: Opportunity[] = [];

    for (const chainId of chainIds) {
      const config = this.configService.getChainConfig(chainId);
      const observedAt = new Date().toISOString();
      let blockNumber = '0';
      let client: ReturnType<typeof createPublicClient> | undefined;

      if (config.rpcUrl) {
        try {
          client = createPublicClient({ transport: http(config.rpcUrl, { timeout: 8_000, retryCount: 1 }) });
          const [rpcChainId, currentBlock] = await Promise.all([client.getChainId(), client.getBlockNumber()]);
          if (rpcChainId !== chainId) throw new Error(`RPC_CHAIN_MISMATCH:${rpcChainId}`);
          blockNumber = currentBlock.toString();
        } catch {
          context.logger.warn(`Could not read block number for opportunity scan on chain ${chainId}`);
        }
      }

      if (chainId === 11155111 || chainId === 84532) {
        const adapter = this.configService.getAdapter('aave-v3', chainId);
        if (!adapter || !client || blockNumber === '0') {
          opportunities.push(unavailableOpportunity('aave-v3', `aave-v3-${chainId}`, `Aave V3 (${config.name})`, chainId, config.usdcAddress, config.aavePoolAddress, blockNumber, observedAt, 'Aave pool and data-provider configuration are required.'));
        } else {
          try {
            const [reserveData, reserveTokens, decimals] = await Promise.all([
              client.readContract({ address: adapter.dataProviderAddress!, abi: AAVE_DATA_PROVIDER_ABI, functionName: 'getReserveData', args: [adapter.assetAddress] }),
              client.readContract({ address: adapter.dataProviderAddress!, abi: AAVE_DATA_PROVIDER_ABI, functionName: 'getReserveTokensAddresses', args: [adapter.assetAddress] }),
              client.readContract({ address: adapter.assetAddress, abi: ERC20_ABI, functionName: 'decimals' }),
            ]);
            const availableLiquidity = await client.readContract({
              address: adapter.assetAddress,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [reserveTokens[0]],
            });
            const liquidityRateRay = reserveData[5];
            const annualRate = Number(liquidityRateRay) / 1e27;
            const apyBps = Math.round(Math.expm1(annualRate) * 10_000);
            if (!Number.isFinite(apyBps) || apyBps < 0 || apyBps > 100_000) throw new Error('Aave liquidity rate is outside the supported range');
            opportunities.push(OpportunitySchema.parse({
              id: `aave-v3-${chainId}`,
              name: `Aave V3 USDC (${config.name})`,
              protocolId: 'aave-v3',
              chainId,
              assetSymbol: 'USDC',
              assetAddress: adapter.assetAddress,
              apyBps,
              liquidity: formatUnits(availableLiquidity, decimals),
              contractAddress: adapter.targetAddress,
              riskScore: 25,
              withdrawalKnown: true,
              rateLabel: 'OBSERVED_TESTNET',
              provenance: {
                chainId,
                blockNumber,
                timestamp: observedAt,
                sourceId: 'aave-v3-data-provider',
                adapterVersion: '1.1.0',
                contractAddress: adapter.dataProviderAddress,
                dataMode: 'LIVE',
                confidence: 'HIGH',
              },
              status: 'LIVE',
            }));
          } catch (error) {
            opportunities.push(unavailableOpportunity('aave-v3', `aave-v3-${chainId}`, `Aave V3 (${config.name})`, chainId, adapter.assetAddress, adapter.targetAddress, blockNumber, observedAt, `Live adapter read failed: ${sanitizeError(error)}`, 'UNAVAILABLE'));
          }
        }
      }

      const vaultAdapter = this.configService.getAdapter('demo-erc4626', chainId);
      if (config.demoVaultAddress || chainId === 80002 || chainId === 84532) {
        if (!vaultAdapter || !client || blockNumber === '0') {
          opportunities.push(unavailableOpportunity('demo-erc4626', `demo-vault-${chainId}`, `Controlled ERC-4626 Vault (${config.name})`, chainId, config.usdcAddress, config.demoVaultAddress, blockNumber, observedAt, 'A validated demo vault address and RPC are required.'));
        } else {
          try {
            const wallet = input.walletAddress as `0x${string}`;
            const [vaultAsset, totalAssets, maxDeposit, _maxRedeem, decimals, code] = await Promise.all([
              client.readContract({ address: vaultAdapter.targetAddress, abi: ERC4626_ABI, functionName: 'asset' }),
              client.readContract({ address: vaultAdapter.targetAddress, abi: ERC4626_ABI, functionName: 'totalAssets' }),
              client.readContract({ address: vaultAdapter.targetAddress, abi: ERC4626_ABI, functionName: 'maxDeposit', args: [wallet] }),
              client.readContract({ address: vaultAdapter.targetAddress, abi: ERC4626_ABI, functionName: 'maxRedeem', args: [wallet] }),
              client.readContract({ address: vaultAdapter.assetAddress, abi: ERC20_ABI, functionName: 'decimals' }),
              client.getBytecode({ address: vaultAdapter.targetAddress }),
            ]);
            if (!code || vaultAsset.toLowerCase() !== vaultAdapter.assetAddress.toLowerCase()) throw new Error('Vault bytecode or asset binding is invalid');
            opportunities.push(OpportunitySchema.parse({
              id: `demo-vault-${chainId}`,
              name: `Controlled ERC-4626 Vault (${config.name})`,
              protocolId: 'demo-erc4626',
              chainId,
              assetSymbol: 'USDC',
              assetAddress: vaultAdapter.assetAddress,
              apyBps: vaultAdapter.controlledApyBps!,
              liquidity: formatUnits(maxDeposit, decimals),
              contractAddress: vaultAdapter.targetAddress,
              riskScore: vaultAdapter.controlledRiskScore!,
              withdrawalKnown: true,
              rateLabel: 'CONTROLLED_SIMULATION',
              provenance: {
                chainId,
                blockNumber,
                timestamp: observedAt,
                sourceId: 'proofyield-controlled-demo-registry',
                adapterVersion: '1.1.0',
                contractAddress: vaultAdapter.targetAddress,
                dataMode: 'SIMULATED',
                confidence: 'MEDIUM',
              },
              status: 'LIVE',
              statusReason: `APY and risk are controlled demo values; deposit capacity and withdrawal interface are live. Current vault TVL: ${formatUnits(totalAssets, decimals)} USDC.`,
            }));
          } catch (error) {
            opportunities.push(unavailableOpportunity('demo-erc4626', `demo-vault-${chainId}`, `Controlled ERC-4626 Vault (${config.name})`, chainId, vaultAdapter.assetAddress, vaultAdapter.targetAddress, blockNumber, observedAt, `Vault validation failed: ${sanitizeError(error)}`, 'UNAVAILABLE'));
          }
        }
      }

      opportunities.push(OpportunitySchema.parse({
        id: `do-nothing-${chainId}`,
        name: `Keep USDC liquid (${config.name})`,
        protocolId: 'do-nothing',
        chainId,
        assetSymbol: 'USDC',
        assetAddress: config.usdcAddress,
        apyBps: 0,
        liquidity: '999999999999999999',
        riskScore: 0,
        withdrawalKnown: true,
        rateLabel: 'BASELINE',
        provenance: {
          chainId,
          blockNumber,
          timestamp: observedAt,
          sourceId: 'proofyield-policy-baseline',
          adapterVersion: '1.1.0',
          dataMode: 'SYSTEM',
          confidence: 'HIGH',
        },
        status: blockNumber === '0' ? 'UNAVAILABLE' : 'LIVE',
        statusReason: blockNumber === '0' ? 'A live chain block is required before the liquid baseline can be evaluated.' : undefined,
      }));
    }

    return this.evidenceRepository.saveOpportunities(z.array(OpportunitySchema).parse(opportunities), {
      walletAddress: input.walletAddress,
      amount: input.amount,
    });
  }
}

function ChainWalletResultSchemaCompat(value: ChainWalletResult): ChainWalletResult {
  return ChainWalletResultSchema.parse(value);
}

function unavailableOpportunity(
  protocolId: 'aave-v3' | 'demo-erc4626',
  id: string,
  name: string,
  chainId: ChainId,
  assetAddress: string | undefined,
  contractAddress: string | undefined,
  blockNumber: string,
  timestamp: string,
  reason: string,
  status: 'NOT_CONFIGURED' | 'UNAVAILABLE' = 'NOT_CONFIGURED',
): Opportunity {
  return OpportunitySchema.parse({
    id,
    name,
    protocolId,
    chainId,
    assetSymbol: 'USDC',
    assetAddress: assetAddress && isAddress(assetAddress) ? assetAddress : undefined,
    apyBps: 0,
    liquidity: '0',
    contractAddress: contractAddress && isAddress(contractAddress) ? contractAddress : undefined,
    riskScore: 100,
    withdrawalKnown: false,
    rateLabel: protocolId === 'demo-erc4626' ? 'CONTROLLED_SIMULATION' : 'OBSERVED_TESTNET',
    provenance: {
      chainId,
      blockNumber,
      timestamp,
      sourceId: status === 'NOT_CONFIGURED' ? 'proofyield-configuration' : 'adapter-error',
      adapterVersion: '1.1.0',
      contractAddress: contractAddress && isAddress(contractAddress) ? contractAddress : undefined,
      dataMode: protocolId === 'demo-erc4626' ? 'SIMULATED' : 'SYSTEM',
      confidence: 'LOW',
    },
    status,
    statusReason: reason,
  });
}

function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/https?:\/\/\S+/g, '[redacted endpoint]').slice(0, 300);
}
