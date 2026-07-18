'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme, useWidgetSDK, useWidgetState } from '@nitrostack/widgets';
import { callBrowserMcpTool } from '../../lib/browser-mcp-client';

export const dynamic = 'force-dynamic';

type TimelineStatus = 'idle' | 'running' | 'done' | 'error';
type TimelineItem = { key: string; label: string; status: TimelineStatus; detail?: string };
type ChainId = 11155111 | 84532 | 80002;

type DashboardPrefs = Record<string, unknown> & {
  walletAddress: string;
  intent: string;
  amount: string;
  chainId: ChainId;
  keepLiquidMinPct: number;
  maxProtocolPct: number;
  maxRiskScore: number;
  horizonDays: number;
};

interface SystemStatus {
  application: 'ProofYield';
  phase: string;
  brain: { reasoning: string; authorization: string };
  supportedChains: Array<{
    chainId: ChainId;
    name: string;
    rpcConfigured: boolean;
    usdcConfigured: boolean;
    adapters: { aaveV3: boolean; demoErc4626: boolean };
  }>;
}

interface WalletSnapshot {
  walletAddress: string;
  snapshotHash: string;
  observedTimestamp: string;
  chains: Array<{
    chainId: ChainId;
    chainName: string;
    status: 'LIVE' | 'NOT_CONFIGURED' | 'ERROR';
    blockNumber?: string;
    nativeBalance?: string;
    assets: Array<{ symbol: string; amount: string; address: string; decimals: number }>;
    positions: Array<{ protocolId: string; assetSymbol: string; amount: string; contractAddress: string }>;
    errorMessage?: string;
  }>;
}

interface Opportunity {
  id: string;
  name: string;
  protocolId: string;
  chainId: ChainId;
  apyBps: number;
  liquidity: string;
  riskScore: number;
  rateLabel: 'OBSERVED_TESTNET' | 'CONTROLLED_SIMULATION' | 'BASELINE';
  status: 'LIVE' | 'NOT_CONFIGURED' | 'UNAVAILABLE';
  statusReason?: string;
  provenance: { blockNumber: string; timestamp: string; sourceId: string; dataMode: string };
}

interface ScoreBreakdown {
  netScore: number;
  yieldBenefit: number;
  gasPenalty: number;
  protocolRiskPenalty: number;
  liquidityPenalty: number;
  concentrationPenalty: number;
  uncertaintyPenalty: number;
}

interface DecisionReceipt {
  receiptId: string;
  stage: string;
  walletAddress: string;
  finalReceiptHash: string;
  policy: DashboardPrefs & { improvementThresholdBps: number; maxDataAgeSeconds: number; maxSlippageBps: number };
  snapshot: WalletSnapshot;
  opportunities: Opportunity[];
  eligibleCandidates: Array<{ opportunity: Opportunity; score: ScoreBreakdown }>;
  selectedOpportunity: Opportunity;
  scoreBreakdown: ScoreBreakdown;
  rejectedCandidates: Array<{ opportunityId: string; code: string; reason: string }>;
  plan: {
    planId: string;
    planHash: string;
    chainId: ChainId;
    protocolId: string;
    requestedAmount: string;
    deployAmount: string;
    liquidReserveAmount: string;
    deadline: string;
    actionType: 'SUPPLY' | 'DEPOSIT' | 'DO_NOTHING';
    steps: Array<{ order: number; kind: string; description: string }>;
  };
  simulation?: SimulationResult;
  preparedTransaction?: PreparedTransaction;
  verifications: ExecutionVerification[];
}

interface TransactionRequest {
  kind: 'APPROVAL' | 'ACTION';
  chainId: ChainId;
  from: string;
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
  description: string;
}

interface SimulationResult {
  planHash: string;
  status: 'PASSED' | 'APPROVAL_REQUIRED' | 'FAILED' | 'NO_ACTION';
  success: boolean;
  blockNumber: string;
  nextTransaction?: TransactionRequest;
  estimatedGas: string;
  simulationHash: string;
  expiresAt: string;
  errorMessage?: string;
}

interface PreparedTransaction extends TransactionRequest {
  planHash: string;
  simulationHash: string;
  warning: string;
  expiresAt: string;
}

interface ExecutionVerification {
  transactionHash: string;
  kind: 'APPROVAL' | 'ACTION';
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'UNVERIFIED';
  confirmations: number;
  postConditionsPassed: boolean;
  postConditions: Array<{ name: string; passed: boolean; expected: string; actual: string }>;
  errorMessage?: string;
}

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

const initialTimeline: TimelineItem[] = [
  { key: 'portfolio', label: 'Read live wallet state', status: 'idle' },
  { key: 'opportunities', label: 'Research allowlisted opportunities', status: 'idle' },
  { key: 'policy', label: 'Apply deterministic policy gates', status: 'idle' },
  { key: 'simulation', label: 'Simulate the next wallet action', status: 'idle' },
];

const DEFAULT_DASHBOARD_PREFS: DashboardPrefs = {
  walletAddress: '',
  intent: 'Allocate 1,000 test USDC. Keep at least 20% liquid, use approved protocols only, and keep risk moderate.',
  amount: '1000',
  chainId: 84532,
  keepLiquidMinPct: 20,
  maxProtocolPct: 60,
  maxRiskScore: 60,
  horizonDays: 30,
};

export default function ProofYieldDashboard() {
  const theme = useTheme();
  const {
    isReady,
    getToolOutput,
    callTool,
    sendFollowUpMessage,
    requestFullscreen,
    requestInline,
    displayMode,
  } = useWidgetSDK();
  const [storedPrefs, setPrefs] = useWidgetState<DashboardPrefs>(() => ({ ...DEFAULT_DASHBOARD_PREFS }));
  // Some MCP hosts briefly return null while synchronized widget state is
  // restored, despite the SDK's non-null overload for a supplied default.
  const prefs = storedPrefs ?? DEFAULT_DASHBOARD_PREFS;
  const initialOutput = getToolOutput<SystemStatus | DecisionReceipt>();
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [snapshot, setSnapshot] = useState<WalletSnapshot | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [receipt, setReceipt] = useState<DecisionReceipt | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [prepared, setPrepared] = useState<PreparedTransaction | null>(null);
  const [verification, setVerification] = useState<ExecutionVerification | null>(null);
  const [monitorResult, setMonitorResult] = useState<{ status: string; triggers: Array<{ code: string; reason: string }> } | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState('');
  const [browserMcpReady, setBrowserMcpReady] = useState(false);

  useEffect(() => {
    if (!initialOutput) return;
    if ('application' in initialOutput) setSystem(initialOutput as SystemStatus);
    if ('receiptId' in initialOutput) {
      const nextReceipt = initialOutput as DecisionReceipt;
      setReceipt(nextReceipt);
      setSnapshot(nextReceipt.snapshot);
      setOpportunities(nextReceipt.opportunities);
      setSimulation(nextReceipt.simulation ?? null);
      setPrepared(nextReceipt.preparedTransaction ?? null);
    }
  }, [initialOutput]);

  useEffect(() => {
    if (initialOutput || isReady) return;
    let cancelled = false;
    callBrowserMcpTool<SystemStatus>('system_getStatus', {})
      .then((status) => {
        if (cancelled) return;
        setSystem(status);
        setBrowserMcpReady(true);
      })
      .catch((caught) => {
        if (cancelled) return;
        setBrowserMcpReady(false);
        setError(`Browser MCP connection failed. Restart npm run dev and refresh this page. ${errorMessage(caught)}`);
      });
    return () => { cancelled = true; };
  }, [initialOutput, isReady]);

  const selectedChain = useMemo(
    () => system?.supportedChains.find((chain) => chain.chainId === prefs.chainId),
    [system, prefs.chainId],
  );
  const isDark = theme === 'dark';

  const updatePrefs = <K extends keyof DashboardPrefs>(key: K, value: DashboardPrefs[K]) => {
    setPrefs((current) => ({ ...(current ?? DEFAULT_DASHBOARD_PREFS), [key]: value }));
  };

  const updateTimeline = (key: string, status: TimelineStatus, detail?: string) => {
    setTimeline((items) => items.map((item) => item.key === key ? { ...item, status, detail } : item));
  };

  const connectWallet = async () => {
    setError(null);
    const provider = getEthereumProvider();
    if (!provider) {
      setError('No injected browser wallet was found in this host. You can still paste a public wallet address below for advisory analysis.');
      return;
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts[0]) throw new Error('Wallet returned no account.');
      updatePrefs('walletAddress', accounts[0]);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  const submitIntentToBrain = async () => {
    if (!isReady) return setError('Host-AI orchestration runs inside NitroStudio. Use deterministic analysis here for the complete browser-wallet flow.');
    if (!isEvmAddress(prefs.walletAddress)) return setError('Connect a wallet or enter a valid public EVM address first.');
    setError(null);
    await sendFollowUpMessage([
      'Use ProofYield to analyze this testnet treasury intent.',
      `Public wallet: ${prefs.walletAddress}`,
      `Intent: ${prefs.intent}`,
      `Policy: chain ${prefs.chainId}; amount ${prefs.amount} USDC; keep ${prefs.keepLiquidMinPct}% liquid; max ${prefs.maxProtocolPct}% per protocol; max risk ${prefs.maxRiskScore}; horizon ${prefs.horizonDays} days.`,
      'Call the ProofYield tools in the safe documented order. Explain the winner, every rejection, simulation status, and never claim execution without live verification.',
    ].join('\n'));
  };

  const runAnalysis = async () => {
    if (!isEvmAddress(prefs.walletAddress)) return setError('Connect a wallet or enter a valid public EVM address first.');
    if (!/^\d+(\.\d{1,18})?$/.test(prefs.amount) || Number(prefs.amount) <= 0) return setError('Enter a positive USDC amount.');

    setBusy('analysis');
    setError(null);
    setReceipt(null);
    setSimulation(null);
    setPrepared(null);
    setVerification(null);
    setMonitorResult(null);
    setTimeline(initialTimeline);
    try {
      updateTimeline('portfolio', 'running');
      const nextSnapshot = await invoke<WalletSnapshot>('portfolio_getSnapshot', {
        walletAddress: prefs.walletAddress,
        chainIds: [prefs.chainId],
      });
      setSnapshot(nextSnapshot);
      updateTimeline('portfolio', 'done', `Block ${nextSnapshot.chains[0]?.blockNumber ?? 'unavailable'}`);

      updateTimeline('opportunities', 'running');
      const nextOpportunities = await invoke<Opportunity[]>('opportunities_scan', {
        walletAddress: prefs.walletAddress,
        assetId: 'USDC',
        amount: prefs.amount,
        allowedChainIds: [prefs.chainId],
      });
      setOpportunities(nextOpportunities);
      updateTimeline('opportunities', 'done', `${nextOpportunities.length} candidates returned`);

      updateTimeline('policy', 'running');
      const nextReceipt = await invoke<DecisionReceipt>('strategy_createPlan', {
        snapshot: nextSnapshot,
        opportunities: nextOpportunities,
        amount: prefs.amount,
        policy: {
          allowedChainIds: [prefs.chainId],
          allowedProtocols: ['aave-v3', 'demo-erc4626', 'do-nothing'],
          assetSymbol: 'USDC',
          keepLiquidMinPct: prefs.keepLiquidMinPct,
          maxProtocolPct: prefs.maxProtocolPct,
          requireManualApproval: true,
          maxDataAgeSeconds: 180,
          improvementThresholdBps: 10,
          maxRiskScore: prefs.maxRiskScore,
          maxSlippageBps: 50,
          horizonDays: prefs.horizonDays,
          planTtlSeconds: 600,
        },
      });
      setReceipt(nextReceipt);
      updateTimeline('policy', 'done', `${nextReceipt.eligibleCandidates.length} eligible, ${nextReceipt.rejectedCandidates.length} rejected`);

      updateTimeline('simulation', 'running');
      const nextSimulation = await invoke<SimulationResult>('plan_simulate', { planHash: nextReceipt.plan.planHash });
      setSimulation(nextSimulation);
      updateTimeline('simulation', nextSimulation.status === 'FAILED' ? 'error' : 'done', humanize(nextSimulation.status));
      await refreshReceipt(nextReceipt.plan.planHash);
    } catch (caught) {
      const message = errorMessage(caught);
      setError(message);
      setTimeline((items) => items.map((item) => item.status === 'running' ? { ...item, status: 'error', detail: message } : item));
    } finally {
      setBusy(null);
    }
  };

  const prepareNext = async () => {
    if (!receipt) return;
    setBusy('prepare');
    setError(null);
    try {
      const nextPrepared = await invoke<PreparedTransaction>('execution_prepare', { planHash: receipt.plan.planHash });
      setPrepared(nextPrepared);
      await refreshReceipt(receipt.plan.planHash);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  };

  const signPrepared = async () => {
    if (!prepared || !receipt) return;
    const provider = getEthereumProvider();
    if (!provider) return setError('A browser wallet is required to sign. No wallet provider is available in this host.');
    setBusy('sign');
    setError(null);
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: toHex(prepared.chainId) }] });
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: prepared.from,
          to: prepared.to,
          data: prepared.data,
          value: toHex(BigInt(prepared.value)),
          gas: prepared.gasLimit ? toHex(BigInt(prepared.gasLimit)) : undefined,
        }],
      }) as string;
      setLastTxHash(hash);
      await verifyTransaction(hash);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  };

  const verifyTransaction = async (hash = lastTxHash) => {
    if (!receipt || !hash) return setError('Enter the transaction hash returned by your wallet.');
    setBusy('verify');
    setError(null);
    try {
      const result = await invoke<ExecutionVerification>('execution_verify', {
        chainId: receipt.plan.chainId,
        transactionHash: hash,
        planHash: receipt.plan.planHash,
      });
      setVerification(result);
      const latest = await refreshReceipt(receipt.plan.planHash);
      if (result.status === 'SUCCESS' && result.kind === 'APPROVAL') {
        const nextSimulation = await invoke<SimulationResult>('plan_simulate', { planHash: receipt.plan.planHash });
        setSimulation(nextSimulation);
        setPrepared(null);
        await refreshReceipt(receipt.plan.planHash);
      } else {
        setReceipt(latest);
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  };

  const runMonitor = async () => {
    if (!receipt) return;
    setBusy('monitor');
    setError(null);
    try {
      const fresh = await invoke<Opportunity[]>('opportunities_scan', {
        walletAddress: receipt.walletAddress,
        assetId: 'USDC',
        amount: receipt.plan.requestedAmount,
        allowedChainIds: [receipt.plan.chainId],
      });
      setOpportunities(fresh);
      const result = await invoke<{ status: string; triggers: Array<{ code: string; reason: string }> }>('monitor_check', {
        planHash: receipt.plan.planHash,
        currentOpportunities: fresh,
      });
      setMonitorResult(result);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  };

  const refreshReceipt = async (planHash: string): Promise<DecisionReceipt> => {
    const latest = await invoke<DecisionReceipt>('receipt_get', { idOrHash: planHash });
    setReceipt(latest);
    setSimulation(latest.simulation ?? null);
    setPrepared(latest.preparedTransaction ?? null);
    return latest;
  };

  const invoke = async <T,>(name: string, args: Record<string, unknown>): Promise<T> => {
    if (!isReady) {
      const result = await callBrowserMcpTool<T>(name, args);
      setBrowserMcpReady(true);
      return result;
    }
    const response = await callTool(name, args);
    if (response.isError) throw new Error(response.result || `${name} failed`);
    if (response.structuredContent !== undefined) return response.structuredContent as T;
    try {
      return JSON.parse(response.result) as T;
    } catch {
      throw new Error(`${name} returned an unreadable response.`);
    }
  };

  return (
    <main className={isDark ? 'app dark' : 'app light'} aria-busy={Boolean(busy)}>
      <style jsx>{`
        * { box-sizing: border-box; }
        .app { --bg:#f4f7fb; --panel:#ffffff; --panel2:#f8fafc; --text:#102033; --muted:#66758a; --line:#dce4ef; --brand:#635bff; --brand2:#0ea5e9; --good:#0f9f6e; --warn:#d97706; --bad:#dc3545; min-height:100vh; padding:18px; color:var(--text); background:radial-gradient(circle at 5% 0%,rgba(99,91,255,.14),transparent 30%),radial-gradient(circle at 100% 0%,rgba(14,165,233,.13),transparent 26%),var(--bg); font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif; }
        .app.dark { --bg:#07111f; --panel:#0d1b2d; --panel2:#112238; --text:#eef5ff; --muted:#9eb0c8; --line:#233a55; --brand:#8b83ff; --brand2:#38bdf8; --good:#34d399; --warn:#fbbf24; --bad:#fb7185; }
        .shell { max-width:1180px; margin:0 auto; }
        .header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:16px; }
        .brand { display:flex; align-items:center; gap:12px; }
        .logo { width:42px; height:42px; display:grid; place-items:center; border-radius:14px; color:white; font-weight:900; background:linear-gradient(135deg,var(--brand),var(--brand2)); box-shadow:0 10px 30px rgba(99,91,255,.3); }
        h1,h2,h3,p { margin:0; }
        h1 { font-size:21px; letter-spacing:-.03em; }
        .subtitle { color:var(--muted); font-size:12px; margin-top:3px; }
        .headerActions { display:flex; gap:8px; }
        button { border:0; font:inherit; cursor:pointer; }
        button:disabled { cursor:not-allowed; opacity:.55; }
        .ghost,.primary,.success { min-height:40px; border-radius:11px; padding:0 14px; font-weight:750; }
        .ghost { color:var(--text); background:var(--panel); border:1px solid var(--line); }
        .primary { color:white; background:linear-gradient(135deg,var(--brand),#756dff); box-shadow:0 8px 22px rgba(99,91,255,.2); }
        .success { color:white; background:var(--good); }
        .hero { display:grid; grid-template-columns:1.25fr .75fr; gap:14px; margin-bottom:14px; }
        .panel { background:color-mix(in srgb,var(--panel) 94%,transparent); border:1px solid var(--line); border-radius:18px; padding:17px; box-shadow:0 12px 36px rgba(15,23,42,.06); }
        .eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:.12em; font-weight:850; color:var(--brand); }
        .heroTitle { font-size:25px; line-height:1.18; letter-spacing:-.04em; margin:7px 0 8px; max-width:700px; }
        .body { color:var(--muted); font-size:13px; line-height:1.55; }
        .brainGrid { display:grid; gap:9px; margin-top:13px; }
        .brain { padding:11px; background:var(--panel2); border:1px solid var(--line); border-radius:12px; }
        .brain strong { font-size:12px; display:block; margin-bottom:3px; }
        .brain span { color:var(--muted); font-size:11px; line-height:1.4; display:block; }
        .statusRow { display:flex; gap:7px; flex-wrap:wrap; margin-top:13px; }
        .pill { display:inline-flex; align-items:center; gap:5px; border:1px solid var(--line); background:var(--panel2); border-radius:999px; padding:5px 9px; font-size:10px; font-weight:800; }
        .dot { width:7px; height:7px; border-radius:50%; background:var(--muted); }
        .dot.good { background:var(--good); } .dot.warn { background:var(--warn); }
        .sectionTitle { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px; }
        .sectionTitle h2 { font-size:15px; letter-spacing:-.02em; }
        label { display:block; color:var(--muted); font-size:11px; font-weight:750; margin-bottom:5px; }
        input,textarea,select { width:100%; border:1px solid var(--line); color:var(--text); background:var(--panel2); border-radius:10px; padding:10px 11px; font:inherit; font-size:12px; outline:none; }
        input:focus,textarea:focus,select:focus { border-color:var(--brand); box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 15%,transparent); }
        textarea { min-height:88px; resize:vertical; line-height:1.45; }
        .walletRow { display:grid; grid-template-columns:1fr auto; gap:8px; }
        .formGrid { display:grid; grid-template-columns:repeat(4,1fr); gap:9px; margin-top:10px; }
        .actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:11px; }
        .error { margin:0 0 14px; padding:11px 13px; border-radius:12px; color:var(--bad); background:color-mix(in srgb,var(--bad) 10%,var(--panel)); border:1px solid color-mix(in srgb,var(--bad) 35%,var(--line)); font-size:12px; }
        .timeline { display:grid; gap:8px; }
        .timelineItem { display:grid; grid-template-columns:23px 1fr; gap:9px; align-items:start; }
        .stepIcon { width:23px; height:23px; border-radius:8px; display:grid; place-items:center; font-size:11px; font-weight:900; color:var(--muted); background:var(--panel2); border:1px solid var(--line); }
        .timelineItem.done .stepIcon { color:white; background:var(--good); border-color:var(--good); }
        .timelineItem.running .stepIcon { color:white; background:var(--brand); border-color:var(--brand); animation:pulse 1.2s infinite; }
        .timelineItem.error .stepIcon { color:white; background:var(--bad); border-color:var(--bad); }
        .timelineLabel { font-size:11px; font-weight:800; padding-top:2px; }
        .timelineDetail { color:var(--muted); font-size:10px; margin-top:2px; }
        .contentGrid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        .cards { display:grid; gap:8px; }
        .card { border:1px solid var(--line); background:var(--panel2); border-radius:13px; padding:12px; }
        .cardTop { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
        .cardTitle { font-size:12px; font-weight:850; }
        .meta { color:var(--muted); font-size:10px; margin-top:3px; line-height:1.4; }
        .metric { font-size:17px; font-weight:900; letter-spacing:-.03em; }
        .metric.good { color:var(--good); }
        .tag { font-size:9px; font-weight:900; letter-spacing:.05em; padding:4px 7px; border-radius:999px; background:var(--panel); border:1px solid var(--line); white-space:nowrap; }
        .tag.live,.tag.success { color:var(--good); } .tag.unavailable,.tag.failed { color:var(--bad); } .tag.pending { color:var(--warn); }
        .splitMetrics { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-top:9px; }
        .mini { border-top:1px solid var(--line); padding-top:7px; }
        .mini b { display:block; font-size:11px; } .mini span { color:var(--muted); font-size:9px; }
        .recommend { border-color:color-mix(in srgb,var(--brand) 55%,var(--line)); background:linear-gradient(135deg,color-mix(in srgb,var(--brand) 10%,var(--panel2)),var(--panel2)); }
        .allocation { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:10px 0; }
        .allocation > div { background:var(--panel); border:1px solid var(--line); border-radius:11px; padding:10px; }
        .allocation strong { display:block; font-size:16px; } .allocation span { color:var(--muted); font-size:9px; }
        .step { display:flex; gap:8px; color:var(--muted); font-size:10px; line-height:1.4; margin-top:7px; }
        .stepNo { flex:0 0 20px; height:20px; display:grid; place-items:center; border-radius:7px; background:var(--brand); color:white; font-weight:900; }
        .reject { border-left:3px solid var(--bad); }
        .hash { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; word-break:break-all; font-size:9px; color:var(--muted); }
        .txBox { margin-top:10px; border-radius:12px; padding:11px; background:var(--panel2); border:1px dashed var(--line); }
        .txGrid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px; }
        .condition { display:flex; justify-content:space-between; gap:8px; padding:6px 0; border-bottom:1px solid var(--line); font-size:10px; }
        .condition:last-child { border:0; }
        .footer { display:flex; justify-content:space-between; gap:12px; align-items:center; color:var(--muted); font-size:9px; padding:3px 2px; }
        @keyframes pulse { 50% { opacity:.55; transform:scale(.94); } }
        @media (prefers-reduced-motion:reduce) { .timelineItem.running .stepIcon { animation:none; } }
        @media (max-width:800px) { .hero,.contentGrid { grid-template-columns:1fr; } .formGrid { grid-template-columns:1fr 1fr; } }
        @media (max-width:520px) { .app { padding:10px; } .header { align-items:flex-start; } .headerActions { flex-direction:column; } .walletRow,.formGrid,.allocation,.txGrid { grid-template-columns:1fr; } .heroTitle { font-size:21px; } }
      `}</style>

      <div className="shell">
        <header className="header">
          <div className="brand">
            <div className="logo" aria-hidden="true">PY</div>
            <div>
              <h1>ProofYield</h1>
              <div className="subtitle">Verifiable testnet treasury decisions</div>
            </div>
          </div>
          <div className="headerActions">
            <button className="ghost" onClick={() => displayMode === 'fullscreen' ? requestInline() : requestFullscreen()}>
              {displayMode === 'fullscreen' ? 'Exit full screen' : 'Full screen'}
            </button>
            <button className="primary" onClick={connectWallet}>Connect wallet</button>
          </div>
        </header>

        {error && <div className="error" role="alert">{error}</div>}

        <section className="hero">
          <div className="panel">
            <div className="eyebrow">Policy-bounded agent</div>
            <h2 className="heroTitle">Find better testnet yield without blindly trusting the AI.</h2>
            <p className="body">The host model understands your prompt. ProofYield’s deterministic core decides what is eligible, simulates the exact next action, requires your wallet signature, and verifies the result on-chain.</p>
            <div className="brainGrid">
              <div className="brain"><strong>Reasoning brain · MCP host LLM</strong><span>{system?.brain.reasoning ?? 'Interprets intent, calls typed tools, and explains the evidence.'}</span></div>
              <div className="brain"><strong>Safety brain · ProofYield code</strong><span>{system?.brain.authorization ?? 'Policy, trusted registries, simulation, approval, and verification cannot be overridden by prose.'}</span></div>
            </div>
            <div className="statusRow">
              <span className="pill"><span className="dot good" />Testnet only</span>
              <span className="pill"><span className="dot good" />Non-custodial</span>
              <span className="pill"><span className="dot good" />Manual approval</span>
              <span className="pill"><span className={isReady || browserMcpReady ? 'dot good' : 'dot warn'} />MCP {isReady ? 'host' : browserMcpReady ? 'browser' : 'connecting'}</span>
              <span className="pill"><span className={selectedChain?.rpcConfigured ? 'dot good' : 'dot warn'} />{selectedChain?.name ?? 'Base Sepolia'} RPC</span>
            </div>
          </div>

          <div className="panel">
            <div className="sectionTitle"><h2>Live MCP workflow</h2><span className="tag">VISIBLE REASONING</span></div>
            <div className="timeline">
              {timeline.map((item, index) => (
                <div className={`timelineItem ${item.status}`} key={item.key}>
                  <div className="stepIcon">{item.status === 'done' ? '✓' : item.status === 'error' ? '!' : index + 1}</div>
                  <div><div className="timelineLabel">{item.label}</div>{item.detail && <div className="timelineDetail">{item.detail}</div>}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel" style={{ marginBottom: 14 }}>
          <div className="sectionTitle"><h2>Describe your treasury intent</h2><span className="tag">NO PRIVATE KEYS</span></div>
          <div className="walletRow">
            <div><label htmlFor="wallet">Public wallet address</label><input id="wallet" value={prefs.walletAddress} onChange={(event) => updatePrefs('walletAddress', event.target.value.trim())} placeholder="0x…" autoComplete="off" /></div>
            <button className="ghost" style={{ alignSelf: 'end' }} onClick={connectWallet}>Use browser wallet</button>
          </div>
          <div style={{ marginTop: 9 }}><label htmlFor="intent">Prompt for the reasoning brain</label><textarea id="intent" value={prefs.intent} onChange={(event) => updatePrefs('intent', event.target.value)} /></div>
          <div className="formGrid">
            <div><label htmlFor="chain">Network</label><select id="chain" value={prefs.chainId} onChange={(event) => updatePrefs('chainId', Number(event.target.value) as ChainId)}><option value={84532}>Base Sepolia</option><option value={11155111}>Ethereum Sepolia</option><option value={80002}>Polygon Amoy</option></select></div>
            <div><label htmlFor="amount">Treasury amount (USDC)</label><input id="amount" value={prefs.amount} onChange={(event) => updatePrefs('amount', event.target.value)} inputMode="decimal" /></div>
            <div><label htmlFor="liquid">Keep liquid (%)</label><input id="liquid" type="number" min="0" max="100" value={prefs.keepLiquidMinPct} onChange={(event) => updatePrefs('keepLiquidMinPct', Number(event.target.value))} /></div>
            <div><label htmlFor="protocol">Max per protocol (%)</label><input id="protocol" type="number" min="1" max="100" value={prefs.maxProtocolPct} onChange={(event) => updatePrefs('maxProtocolPct', Number(event.target.value))} /></div>
            <div><label htmlFor="risk">Maximum risk (0–100)</label><input id="risk" type="number" min="0" max="100" value={prefs.maxRiskScore} onChange={(event) => updatePrefs('maxRiskScore', Number(event.target.value))} /></div>
            <div><label htmlFor="horizon">Horizon (days)</label><input id="horizon" type="number" min="1" max="3650" value={prefs.horizonDays} onChange={(event) => updatePrefs('horizonDays', Number(event.target.value))} /></div>
          </div>
          <div className="actions">
            <button className="primary" disabled={Boolean(busy)} onClick={runAnalysis}>{busy === 'analysis' ? 'Analyzing…' : 'Run deterministic analysis'}</button>
            <button className="ghost" disabled={!isReady || Boolean(busy)} onClick={submitIntentToBrain}>Ask host AI to orchestrate</button>
          </div>
        </section>

        <section className="contentGrid">
          <div className="panel">
            <div className="sectionTitle"><h2>Portfolio snapshot</h2><span className="tag">LIVE RPC</span></div>
            {!snapshot ? <p className="body">Connect or enter a wallet and run the analysis.</p> : (
              <div className="cards">{snapshot.chains.map((chain) => <div className="card" key={chain.chainId}><div className="cardTop"><div><div className="cardTitle">{chain.chainName}</div><div className="meta">Block {chain.blockNumber ?? 'unavailable'} · {chain.status}</div></div><span className={`tag ${chain.status === 'LIVE' ? 'live' : 'unavailable'}`}>{chain.status}</span></div><div className="splitMetrics"><div className="mini"><b>{shortAmount(chain.assets.find((asset) => asset.symbol === 'USDC')?.amount ?? '—')}</b><span>wallet USDC</span></div><div className="mini"><b>{shortAmount(chain.nativeBalance ?? '—')}</b><span>native gas</span></div><div className="mini"><b>{chain.positions.length}</b><span>positions</span></div></div>{chain.positions.map((position) => <div className="condition" key={`${position.protocolId}-${position.contractAddress}`}><span>{humanize(position.protocolId)}</span><b>{shortAmount(position.amount)} {position.assetSymbol}</b></div>)}{chain.errorMessage && <div className="meta">{chain.errorMessage}</div>}</div>)}</div>
            )}
          </div>

          <div className="panel">
            <div className="sectionTitle"><h2>Approved opportunity research</h2><span className="tag">PROVENANCE</span></div>
            {opportunities.length === 0 ? <p className="body">No scan has run yet.</p> : <div className="cards">{opportunities.map((opportunity) => <div className={`card ${receipt?.selectedOpportunity.id === opportunity.id ? 'recommend' : ''}`} key={opportunity.id}><div className="cardTop"><div><div className="cardTitle">{opportunity.name}</div><div className="meta">{opportunity.rateLabel.replaceAll('_', ' ')} · block {opportunity.provenance.blockNumber}</div></div><span className={`tag ${opportunity.status === 'LIVE' ? 'live' : 'unavailable'}`}>{opportunity.status}</span></div><div className="splitMetrics"><div className="mini"><b className={opportunity.status === 'LIVE' ? 'good' : ''}>{(opportunity.apyBps / 100).toFixed(2)}%</b><span>rate estimate</span></div><div className="mini"><b>{opportunity.riskScore}/100</b><span>risk</span></div><div className="mini"><b>{shortAmount(opportunity.liquidity)}</b><span>liquidity</span></div></div>{opportunity.statusReason && <div className="meta">{opportunity.statusReason}</div>}</div>)}</div>}
          </div>
        </section>

        {receipt && <section className="contentGrid">
          <div className="panel recommend">
            <div className="sectionTitle"><h2>Recommended policy-compliant plan</h2><span className="tag live">{receipt.stage}</span></div>
            <div className="cardTitle" style={{ fontSize: 17 }}>{receipt.selectedOpportunity.name}</div>
            <div className="meta">Horizon-adjusted net score {receipt.scoreBreakdown.netScore} bps · risk {receipt.selectedOpportunity.riskScore}/100 · deadline {new Date(receipt.plan.deadline).toLocaleTimeString()}</div>
            <div className="allocation"><div><strong>{receipt.plan.deployAmount} USDC</strong><span>bounded deployment</span></div><div><strong>{receipt.plan.liquidReserveAmount} USDC</strong><span>minimum remaining liquid</span></div></div>
            {receipt.plan.steps.map((step) => <div className="step" key={step.order}><span className="stepNo">{step.order}</span><span><b>{step.kind}</b><br />{step.description}</span></div>)}
            <div style={{ marginTop: 11 }} className="hash">Plan {receipt.plan.planHash}<br />Receipt {receipt.finalReceiptHash}</div>
          </div>

          <div className="panel">
            <div className="sectionTitle"><h2>Counterfactual reject list</h2><span className="tag">{receipt.rejectedCandidates.length} REJECTED</span></div>
            {receipt.rejectedCandidates.length === 0 ? <p className="body">Every supplied candidate passed hard eligibility gates.</p> : <div className="cards">{receipt.rejectedCandidates.map((rejection, index) => <div className="card reject" key={`${rejection.opportunityId}-${index}`}><div className="cardTitle">{rejection.code}</div><div className="meta">{rejection.opportunityId} · {rejection.reason}</div></div>)}</div>}
          </div>
        </section>}

        {receipt && <section className="contentGrid">
          <div className="panel">
            <div className="sectionTitle"><h2>Simulation & wallet approval</h2>{simulation && <span className={`tag ${simulation.status === 'FAILED' ? 'failed' : simulation.status === 'APPROVAL_REQUIRED' ? 'pending' : 'success'}`}>{humanize(simulation.status)}</span>}</div>
            {!simulation ? <p className="body">Simulation has not run.</p> : <>
              <div className="splitMetrics"><div className="mini"><b>{simulation.blockNumber}</b><span>simulated block</span></div><div className="mini"><b>{simulation.estimatedGas}</b><span>estimated gas</span></div><div className="mini"><b>{new Date(simulation.expiresAt).toLocaleTimeString()}</b><span>expires</span></div></div>
              {simulation.errorMessage && <div className="error" style={{ marginTop: 10, marginBottom: 0 }}>{simulation.errorMessage}</div>}
              {simulation.nextTransaction && <div className="txBox"><div className="cardTitle">Next bounded action · {simulation.nextTransaction.kind}</div><div className="meta">{simulation.nextTransaction.description}</div><div className="hash" style={{ marginTop: 7 }}>To {simulation.nextTransaction.to}<br />Data {simulation.nextTransaction.data.slice(0, 42)}…</div></div>}
              <div className="actions">{simulation.nextTransaction && <button className="primary" disabled={Boolean(busy)} onClick={prepareNext}>{busy === 'prepare' ? 'Preparing…' : 'Prepare exact transaction'}</button>}</div>
            </>}
          </div>

          <div className="panel">
            <div className="sectionTitle"><h2>Sign & verify</h2><span className="tag">BROWSER WALLET</span></div>
            {!prepared ? <p className="body">A transaction appears here only after the matching simulation passes.</p> : <>
              <div className="card recommend"><div className="cardTop"><div><div className="cardTitle">{prepared.kind}</div><div className="meta">{prepared.description}</div></div><span className="tag pending">UNSIGNED</span></div><div className="hash" style={{ marginTop: 8 }}>{prepared.to}<br />simulation {prepared.simulationHash}</div></div>
              <p className="body" style={{ marginTop: 8 }}>{prepared.warning}</p>
              <div className="actions"><button className="success" disabled={Boolean(busy)} onClick={signPrepared}>{busy === 'sign' ? 'Waiting for wallet…' : 'Inspect & sign in wallet'}</button></div>
            </>}
            <div style={{ marginTop: 10 }}><label htmlFor="txhash">Transaction hash (wallet fallback)</label><div className="walletRow"><input id="txhash" value={lastTxHash} onChange={(event) => setLastTxHash(event.target.value.trim())} placeholder="0x…" /><button className="ghost" disabled={Boolean(busy) || !prepared} onClick={() => verifyTransaction()}>{busy === 'verify' ? 'Verifying…' : 'Verify'}</button></div></div>
            {verification && <div className="txBox"><div className="cardTop"><div className="cardTitle">On-chain verification</div><span className={`tag ${verification.status.toLowerCase()}`}>{verification.status}</span></div><div className="meta">{verification.confirmations} confirmation(s) · postconditions {verification.postConditionsPassed ? 'passed' : 'not proven'}</div>{verification.postConditions.map((condition) => <div className="condition" key={condition.name}><span>{condition.name}</span><b style={{ color: condition.passed ? 'var(--good)' : 'var(--bad)' }}>{condition.passed ? 'PASS' : 'FAIL'}</b></div>)}</div>}
          </div>
        </section>}

        {receipt && <section className="panel" style={{ marginBottom: 14 }}>
          <div className="sectionTitle"><h2>Monitoring & rebalance proposal</h2>{monitorResult && <span className={`tag ${monitorResult.status === 'HEALTHY' ? 'live' : 'pending'}`}>{humanize(monitorResult.status)}</span>}</div>
          <p className="body">Monitoring re-reads approved opportunities and can propose a new plan. It never moves funds automatically.</p>
          <div className="actions"><button className="ghost" disabled={Boolean(busy)} onClick={runMonitor}>{busy === 'monitor' ? 'Checking…' : 'Check current conditions'}</button></div>
          {monitorResult?.triggers.map((trigger) => <div className="card reject" style={{ marginTop: 8 }} key={trigger.code}><div className="cardTitle">{trigger.code}</div><div className="meta">{trigger.reason}</div></div>)}
        </section>}

        <footer className="footer"><span>Testnet assets have no financial value. Not investment advice.</span><span>ProofYield · policy before optimization</span></footer>
      </div>
    </main>
  );
}

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum;
}

function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function humanize(value: string): string {
  return value.replaceAll('_', ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function shortAmount(value: string): string {
  if (value === '—') return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return number.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function toHex(value: bigint | number): `0x${string}` {
  return `0x${BigInt(value).toString(16)}`;
}
