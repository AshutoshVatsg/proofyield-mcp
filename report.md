# ProofYield Project Audit Report

**Audit date:** 18 July 2026  
**Audit basis:** `IDEA.md`, the narrower implementation contract in `idea-brief.txt`, all application source/configuration files, compiled startup behavior, production builds, live Base Sepolia read behavior, adversarial tool calls, and npm advisories.  
**Change policy:** This audit did not modify application source code. This report is the only intentional project deliverable.

> **Remediation update (18 July 2026):** This document preserves the original pre-remediation findings. The implementation was subsequently hardened: live allowlisted adapters replaced fabricated opportunity data; SHA-256 evidence/plan/receipt binding and a server-issued evidence registry were added; policy gates now include freshness, balances, current positions, liquidity, concentration, risk, and meaningful horizon-adjusted improvement; live simulation, exact approvals, trusted calldata generation, replay protection, on-chain verification, receipt persistence, monitoring, a wallet-enabled dashboard, and a controlled ERC-4626 test vault were implemented. Backend/widget builds, nine security regression tests, Solidity compilation, zero-vulnerability npm audits, and a live chain-ID-pinned Base Sepolia read now pass. A real deposit demo remains externally blocked until the controlled vault is deployed and its public address is configured. NitroStack 1.0.13 also emits a non-fatal optional-OAuth provider resolution error during otherwise successful STDIO startup; hosted HTTP deployment must use a properly configured OAuth 2.1 module and user-scoped persistence.

## 1. Executive verdict

ProofYield has a strong, differentiated hackathon concept and a workable NitroStack foundation, but the repository does **not** currently implement the end-to-end product described in `IDEA.md`. It is best described today as:

> A testnet wallet reader and partially deterministic recommendation prototype with a dashboard asset—not yet a safe simulation, approval, execution, verification, receipt, or monitoring system.

The good news is that the project is small and salvageable. The live Base Sepolia portfolio read works, the TypeScript and widget production builds pass, MCP startup registers seven tools, and the code already contains useful shared schemas and a visible reject-list concept. These are enough to demonstrate serious fintech/BFSI potential if the demo is made truthful and the critical execution-path defects are fixed or the unsafe execution tools are explicitly disabled.

### Readiness summary

| Question | Verdict |
|---|---|
| Does the root project build? | **Yes.** `npm run build` passed outside the filesystem sandbox. |
| Does the widget build? | **Yes.** Next.js production build passed. |
| Does TypeScript strict checking pass? | **Yes.** `npx tsc --noEmit` passed. |
| Does the MCP server start and register capabilities? | **Partly.** It starts over STDIO and registers 7 tools, but logs an OAuth provider-resolution error and registers placeholder resources/prompts. |
| Does live Base Sepolia wallet/USDC reading work? | **Yes.** A read-only live RPC test returned a current block plus native and USDC balances. |
| Does live opportunity discovery work? | **No.** APY, liquidity, and block data are hard-coded; the configured environment has no Aave pool or vault address. |
| Can it produce a recommendation? | **Partly.** It can rank supplied candidates, but key policy gates are unused and supplied facts are not trusted/validated. In the current environment, only `DO_NOTHING` is eligible. |
| Does it simulate a plan? | **No.** No `plan_simulate` tool exists. |
| Does it connect a wallet and obtain approval/signature? | **No.** The widget has no wallet connection or signing flow. |
| Does it safely prepare a real transaction? | **No.** Preparation does not require simulation or approval, does not enforce an address registry, and creates malformed/mock calldata. |
| Does it verify a submitted transaction? | **No.** It reports hard-coded `SUCCESS` for arbitrary input without an RPC read. |
| Is the Decision Receipt verifiable? | **No.** Generated receipts fail their own schema and use a collision-prone 32-bit non-cryptographic hash. |
| Does monitoring/rebalancing work? | **No.** There is no monitoring tool or trigger. |
| Is it hackathon-demo ready? | **Not for the claimed execution story.** It can become demo-ready after the P0 work in section 11, or immediately if presented honestly as advisory-only. |
| Is it production-ready? | **No.** The current `Production-Ready Testnet Agent` status is inaccurate. |

## 2. Scope and interpretation

`IDEA.md` contains both an ambitious product architecture and explicit hackathon scope. `idea-brief.txt` narrows that into one NitroStack server, eight required tools, one resource, one prompt, one widget, live testnet reads, and an in-memory receipt store. This report uses the brief when it deliberately simplifies the larger architecture. For example, one MCP deployment is not treated as a defect; the missing logical trust, simulation, and execution boundaries inside that deployment are defects.

Stretch goals such as CCTP, smart accounts, Chainlink Automation, and on-chain receipt anchoring are not counted as MVP failures. Mainnet readiness is also explicitly out of scope. Production recommendations are included because they were requested, but they are separated from the minimum hackathon work.

No smart contracts exist in the repository, so contract-level testing for reentrancy, access control, oracle manipulation, upgrade safety, and invariant violations was not possible. Their absence is recorded as an implementation gap where the idea requires contracts.

## 3. Verified strengths

1. **The project compiles.** Backend strict TypeScript checking and both production builds pass.
2. **Live Base Sepolia reads work.** `portfolio_getSnapshot` successfully queried a configured Base Sepolia RPC, fetched a current block, native balance, ERC-20 balance, and token decimals.
3. **Private-key custody is avoided.** No backend signer, seed phrase, or private-key execution path was found.
4. **The local `.env` is ignored and untracked.** No high-confidence embedded secret was found in audited source/configuration files.
5. **The code has a reasonable modular start.** Discovery, planning, shared schemas/configuration, receipt repository, health check, and widget code are separated.
6. **Eligibility precedes ranking in the current planner.** This matches a key design principle, although the gate set is incomplete.
7. **`DO_NOTHING` is modeled as a candidate.** This is an important product differentiator and a sound safety principle.
8. **Partial network failure is represented per chain.** One unreachable/unconfigured RPC does not necessarily destroy the full snapshot response.
9. **Amounts are generally represented as strings and rates as basis points.** This is directionally correct for financial code, though amount semantics are not enforced.
10. **The root production dependency audit reported zero known vulnerabilities.** The widget dependency tree has separate findings below.
11. **The dashboard communicates “Testnet Only.”** This aligns with the product disclaimer, even though other UX and linkage gaps remain.

These strengths support a credible judge story: MCP orchestration, policy-driven decisions, counterfactual rejections, and decision receipts are meaningful BFSI ideas. The issue is not the idea; it is that the current code claims security properties that it does not yet enforce.

## 4. IDEA.md end-to-end flow compliance

| IDEA flow | Status | Evidence and gap |
|---|---|---|
| 1. Read wallet and current positions | **Partial** | Native and USDC balances are read in `discovery.tools.ts:93-286`. Protocol positions, allowances, and current allocation are not read. |
| 2. Collect approved opportunities | **Broken/partial** | Candidate objects exist, but APY/liquidity/block numbers are hard-coded (`discovery.tools.ts:317-366`). No adapter interface or live Aave/vault state query exists. |
| 3. Reject hard-policy violations | **Partial and bypassable** | Chain/protocol/asset/status/basic freshness checks exist (`planning.tools.ts:165-313`), but provenance, registry, liquidity, concentration, amount, and risk checks are missing or fail open. |
| 4. Calculate net-return and risk metrics | **Partial** | A transparent score exists, but penalties are protocol-name constants and ignore amount, horizon, gas price, fees, liquidity, withdrawal rules, and policy weights (`planning.tools.ts:293-300`). |
| 5. Ranked recommendation and reject list | **Partial** | One selected score and rejection list are returned. Eligible alternatives and their scores are not returned in the receipt. |
| 6. Compile a typed execution plan | **Partial/unsafe** | `ActionPlan` exists, but has no deadline, nonce, simulation hash, token address, allowance action, dependencies, expected deltas, or policy version. |
| 7. Simulate every state change | **Missing** | Only a `SimulationResultSchema` exists. There is no simulation tool or implementation. |
| 8. Explicit approval and wallet signing | **Missing** | `requireManualApproval` is stored but never enforced. No wallet connect/sign/submit UI exists. |
| 9. Execute through bounded adapters | **Missing/unsafe stub** | No adapter registry or submit tool exists. `execution_prepare` creates mock calldata and accepts plans derived from attacker-supplied targets. |
| 10. Verify post-transaction state | **Fabricated** | `execution_verify` returns fixed success/block/gas values without reading the chain (`planning.tools.ts:471-494`). |
| 11. Create a complete Decision Receipt | **Partial/invalid** | A receipt is stored in memory, but it fails `DecisionReceiptSchema`, loses provenance, has no simulation/approval, and uses an 8-hex-digit hash. |
| 12. Monitor and propose rebalance | **Missing** | No monitor module, tool, scheduler, risk event, or proposal flow exists. |

## 5. Must-have MVP compliance

This table maps `IDEA.md` section 20.1 and the stricter completion gate in `idea-brief.txt`.

| Must-have | Status | Notes |
|---|---|---|
| Connect Base Sepolia wallet | **Missing** | A caller may supply an address, but the UI does not connect a browser wallet. |
| Read test USDC balance | **Working on Base** | Live read was verified. Ethereum/Polygon were not configured in the audited environment. |
| Policy preset and custom limits | **Partial** | A default object and optional input exist; there is no policy editor, and major limits are not enforced. |
| Portfolio MCP | **Partial** | One snapshot tool, no positions/allowances/allocation. |
| Opportunity MCP with Aave and mock vaults | **Not working as claimed** | Objects are generated, not queried. Actual environment has neither Aave pool nor vault configured. |
| Deterministic eligibility/scoring | **Partial/unsafe** | Deterministic, but incomplete and based on untrusted inputs/static penalties. |
| Rejected-candidate explanations | **Partial** | Several exact codes exist, but several declared codes are never emitted. |
| Typed ActionPlan | **Partial** | Type exists but lacks safety-critical fields and is not validated on creation/preparation. |
| Simulation MCP / `plan_simulate` | **Missing** | Required eighth tool is absent. |
| User wallet approval | **Missing** | No approval/signature integration. |
| Supply/deposit execution | **Missing** | No signed transaction submission; prepared payload is not valid protocol calldata. |
| Postcondition verification | **Missing; current result is false** | Hard-coded success is more dangerous than an explicit stub. |
| Decision Receipt | **Partial/invalid** | In-memory object exists, but it is incomplete and not cryptographically verifiable. |
| Monitoring-generated rebalance proposal | **Missing** | No implementation. |
| `proofyield://capabilities` resource | **Missing** | Only `discovery://example` and `planning://example` TODO resources exist. |
| `proofyield_treasury_help` prompt | **Missing** | Only two TODO help prompts exist. |
| Linked `proofyield-dashboard` widget | **Broken linkage** | Widget HTML builds, but no tool has `@Widget`, while the manifest still declares `/calculator-result`. |
| Deployment/setup documentation | **Missing** | README and package/widget metadata still describe the calculator starter. |

### Tool registration reality

Startup registered these seven tools:

1. `system_getStatus`
2. `portfolio_getSnapshot`
3. `opportunities_scan`
4. `strategy_createPlan`
5. `execution_prepare`
6. `execution_verify`
7. `receipt_get`

The required `plan_simulate` tool is absent. No risk-specific or monitoring tool is present. Tool names also mix camelCase and snake_case, which is legal but inconsistent.

## 6. Security and correctness findings

Severity reflects the present testnet hackathon context. Any deployment involving real assets would make several High findings Critical.

### C-01 — Execution verification is fabricated

**Severity:** Critical  
**Location:** `src/modules/planning/planning.tools.ts:462-494`

`execution_verify` never creates an RPC client, never loads a transaction receipt, never confirms transaction status, never binds the transaction to the plan, and never checks balances or postconditions. It unconditionally returns:

- `status: SUCCESS`
- fixed block `19485725`
- fixed gas `142053`

An adversarial runtime test supplied chain `80002` and transaction hash `not-a-transaction-hash` for a Base plan; the tool returned `SUCCESS`.

**Impact:** Users and judges can be shown a false execution result and false audit receipt. In a BFSI product this destroys the evidence chain and may authorize later decisions from nonexistent state.

**Required fix:** Query the configured chain with `getTransactionReceipt`, require a valid 32-byte transaction hash, ensure input chain equals plan chain, check receipt success, decode/compare expected calls or events, re-read balances/positions, verify every postcondition, and return `PENDING`, `FAILED`, or `UNVERIFIED` when proof is unavailable. Until implemented, remove/disable the tool or label it explicitly as a non-verifying demo stub that can never emit `SUCCESS`.

### C-02 — Transaction preparation bypasses the claimed trust boundary and generates invalid calldata

**Severity:** Critical  
**Location:** `src/modules/planning/planning.tools.ts:407-459`

Preparation requires only a `planHash` found in memory. It does not require or check:

- passing simulation or simulation hash;
- explicit approval;
- plan deadline/freshness;
- nonce/replay state;
- wallet binding/authentication;
- token balance or allowance;
- policy revalidation;
- chain/contract/bytecode registry;
- function selector registry.

The target comes from `selectedOpp.contractAddress`, which itself comes from caller-supplied `opportunities`. A caller can allow its own protocol string in its supplied policy and cause a plan to target an arbitrary nonzero address. The adversarial test did exactly this.

The payload construction at lines 439-442 concatenates a selector with a padded decimal string. It does not use ABI encoding, token base units, the asset address, recipient/on-behalf-of address, referral code, or all required arguments. The observed payload length was 66 characters (`0x` plus 32 bytes), which is not a valid Aave supply call or ERC-4626 deposit call.

**Impact:** A malicious or malformed candidate can determine the transaction target, and honest transactions are likely to revert or call the wrong ABI shape.

**Required fix:** Introduce a versioned registry keyed by `(chainId, protocolId)`; ignore caller-supplied target addresses; construct calls with viem `encodeFunctionData` and fixed ABIs; convert decimal amounts using verified token decimals; enforce exact approval/spender/amount; require a stored, unexpired, matching, passing simulation; and mark prepared/executed plan nonces to prevent replay.

### C-03 — “Verifiable” hashes are collision-prone and not cryptographic

**Severity:** Critical  
**Location:** `src/modules/shared/schemas.ts:220-243`

`deterministicHash` is a 32-bit FNV-1a-style checksum that returns only eight hex digits. It is unsuitable for policy, plan, simulation, snapshot, or receipt integrity. A bounded audit test found two distinct payloads with the same project hash:

```text
hash: 0x6053226c
payload 1: { candidateId: "candidate-5ed7caf5-56ae1f11", amount: "1019396951" }
payload 2: { candidateId: "candidate-7373f549-b680a724", amount: "4008359126" }
```

The receipt also hashes itself while `finalReceiptHash` changes between stages, so there is no documented canonical rule for excluding the hash field.

**Impact:** Different plans/receipts can share an identifier, stored entries can collide, and the result cannot support the “cryptographically hashable” or future on-chain anchoring claim.

**Required fix:** Define canonical JSON rules and hash UTF-8 bytes with SHA-256 or Keccak-256. Exclude `finalReceiptHash` from the preimage, include explicit schema/version/domain separation, and test canonical equivalence plus known vectors.

### H-01 — Planner accepts untrusted, structurally invalid financial facts

**Severity:** High  
**Location:** `src/modules/planning/planning.tools.ts:22-127`

The MCP schema uses `z.any()` for `snapshot` and `opportunities`. Parsed objects are then validated with a few manual checks only. Wallet validation checks only `startsWith('0x')`; the test value `0xnotActuallyAnAddress` was accepted. Opportunities are not parsed with `OpportunitySchema`, and policy numbers have no bounds.

Caller-provided `snapshotHash` is trusted rather than recomputed. Missing/invalid provenance, arbitrary adapter versions, arbitrary protocol IDs, arbitrary addresses, negative/huge/invalid amounts, and malformed chain records can enter the planner.

**Required fix:** Use the shared Zod schemas as actual input parsers, add exact EVM address/hash/decimal-string refinements, `.finite()`/integer/range constraints, strict objects, bounded array sizes, and output schemas. Prefer server-side snapshot/opportunity references over accepting full caller-authored “execution truth.”

### H-02 — Core policy fields are displayed but not enforced

**Severity:** High  
**Location:** `src/modules/planning/planning.tools.ts:129-356`; `src/widgets/app/proofyield-dashboard/page.tsx:229-257`

`keepLiquidMinPct`, `maxProtocolPct`, `requireManualApproval`, and `improvementThresholdBps` are never used in eligibility or plan amount calculation. The planner also does not compare amount with wallet balance, liquidity, per-transaction cap, risk score, or current positions.

The adversarial test used a 1-USDC snapshot, requested `1,000,000,000,000`, set 99% minimum liquid, 1% maximum protocol exposure, and a 10,000-bps improvement threshold; the plan was still accepted.

Several declared rejection codes—`PROVENANCE_MISSING`, `RISK_LIMIT_EXCEEDED`, `LIQUIDITY_INSUFFICIENT`, `CONCENTRATION_LIMIT_EXCEEDED`, and `NO_MEANINGFUL_IMPROVEMENT`—are never emitted.

**Impact:** The main “policy constitution” differentiator is cosmetic. A plan can directly violate the policy shown to the user.

**Required fix:** Implement and unit-test every hard gate, calculate the deployable amount after reserve constraints, reject amounts above available balance/transaction cap, return all eligible alternatives and gate results, and make approval mode an enforced state transition rather than a receipt field.

### H-03 — Opportunity data is hard-coded and can be falsely labeled `live-rpc`

**Severity:** High  
**Location:** `src/modules/discovery/discovery.tools.ts:289-393`

`opportunities_scan` does not query Aave or a vault. It uses fixed APYs (4.5%, 5.2%, 6.8%), liquidity, and old fixed block numbers. If an RPC and protocol address are configured, it changes `sourceId` to `live-rpc` even though those values were not read from RPC. `walletAddress`, `assetId`, and `amount` are not validated or used to query/normalize an opportunity.

In the audited environment the Base RPC and USDC address are set, but the Aave pool is not. The scan therefore returned Aave as `NOT_CONFIGURED`/`mock-adapter` and only `DO_NOTHING` as live. This is truthful for the current environment, but setting a pool address would incorrectly relabel static facts as live.

**Impact:** Decisions can be based on fabricated financial data and misleading provenance—the exact failure the brief forbids.

**Required fix:** Add adapter interfaces and real contract reads for reserve/vault state. If real APY is unavailable on testnet, mark a controlled value `SIMULATED` with a scenario ID and current on-chain block metadata; never call it `live-rpc`. Do not expose made-up liquidity as observed data.

### H-04 — Simulation, freshness binding, and replay protection are absent

**Severity:** High  
**Location:** `src/modules/shared/schemas.ts:154-172`; no corresponding tool implementation

There is a simulation type but no tool. Plans have no nonce, deadline, simulation hash, quote/block expiry, or consumed state. `execution_prepare` does not revalidate the plan or data age.

**Impact:** The product cannot meet the central invariant that every state change is linked to a passing simulation and current policy/data snapshot. Plans can be prepared repeatedly and indefinitely.

**Required fix:** Implement `plan_simulate`, include simulation pre/postconditions and block number, add plan expiry/nonce, persist state transitions, and fail closed on missing/mismatched/expired simulation.

### H-05 — Decision Receipts fail their own schema and omit required evidence

**Severity:** High  
**Location:** `src/modules/shared/schemas.ts:200-218`; `src/modules/planning/planning.tools.ts:361-404`

The planner casts incomplete summaries with `as any`. Runtime `DecisionReceiptSchema.safeParse(receipt)` failed because snapshot chain provenance and multiple opportunity fields were absent. The receipt also omits:

- receipt/schema version and original structured intent;
- eligible candidate list and all score breakdowns;
- detailed policy gate results;
- simulation and approval evidence;
- canonical transaction list;
- expected versus actual deltas/postconditions;
- data confidence and source contract metadata.

It stores caller-supplied snapshot data without independently validating it. Updating preparation/verification mutates the same object and changes its hash, without an append-only history.

**Impact:** A receipt cannot reproduce or prove the decision described in `IDEA.md`.

**Required fix:** Build the receipt from validated internal records; validate it before saving/returning; keep immutable versioned stages or an append-only event list; include full provenance and policy checks; and use a cryptographic canonical hash.

### H-06 — Widget exists as a build artifact but is not connected to the tool flow

**Severity:** High for demo readiness  
**Location:** `src/widgets/widget-manifest.json:1-48`; all tool methods; dashboard page

No tool uses `@Widget('proofyield-dashboard')`. At startup, NitroStack loads one widget from the manifest, but that manifest still declares `/calculator-result`, calculator examples, and calculator tags. The built file is `proofyield-dashboard.html`, so manifest route and artifact do not match.

The dashboard itself expects a Decision Receipt but is never attached to `strategy_createPlan` or `receipt_get`. It has no error boundary at the page level for missing nested fields and no action buttons for simulate, prepare, connect, sign, verify, or refresh.

**Impact:** The main visual demo is likely not displayed when the relevant tool runs, despite the widget build passing.

**Required fix:** Replace the manifest with the ProofYield route/examples, attach the appropriate tool with `@Widget`, add an object-form CSP/domain policy, and manually verify the tool-to-widget path in NitroStudio/OpenAI mode.

### H-07 — Widget dependency tree contains known vulnerabilities

**Severity:** High advisory / context-dependent exploitability  
**Location:** `src/widgets/package-lock.json`; resolved Next.js `14.2.35`

`npm audit --omit=dev` reports two production dependency issues: one High for Next.js (a group of DoS/cache/XSS/SSRF/server findings across affected versions) and one Moderate for PostCSS XSS. npm proposes a breaking Next.js 16 update.

The current NitroStack build bundles a static HTML widget, which reduces exposure to many self-hosted Next server vulnerabilities. Risk increases if `next start` is deployed or if future server routes/middleware are added.

**Required fix:** For the hackathon, serve only the static bundled widget and document that constraint. Then test a supported patched Next release with NitroStack; do not blindly run `npm audit fix --force` immediately before the demo.

### H-08 — No automated tests protect financial invariants

**Severity:** High for production, Medium for initial hackathon scope

No unit, integration, contract, widget, or end-to-end test files were found. There is no lint script or CI configuration. The original brief explicitly avoided creating a test runner during first generation, but production-level assessment requires one now.

**Required fix:** Add a small, high-value suite first: policy boundary tables, missing/invalid provenance, amount/balance/reserve invariants, `DO_NOTHING`, deterministic ranking, canonical hashes, simulation-required preparation, wrong-chain verification, malformed transaction hashes, and receipt schema validation.

### M-01 — Freshness and provenance validation fail open

**Severity:** Medium  
**Location:** `src/modules/planning/planning.tools.ts:169-291`

Missing timestamps skip the freshness check. Invalid timestamps yield `NaN`, which also does not exceed the age limit. Missing block/source/adapter/contract metadata is not rejected. The source string `live-rpc` is trusted without verifying origin.

**Fix:** Require complete provenance for external candidates, parse valid ISO timestamps, ensure timestamps are not unreasonably future-dated, bind them to chain/block reads, and emit `PROVENANCE_MISSING`/`DATA_STALE` deterministically.

### M-02 — Address and configuration validation is incomplete

**Severity:** Medium  
**Location:** `src/modules/shared/config.service.ts`; `discovery.tools.ts`; `planning.tools.ts`

Wallet addresses are correctly validated only in `portfolio_getSnapshot`. Opportunity inputs and configured token/pool/vault addresses are not uniformly parsed with `isAddress`; any nonempty pool/vault value is treated as configured. No versioned registry, bytecode check, verified decimals constraint, or chain-address binding exists.

**Fix:** Validate configuration at startup into typed immutable registries, return structured configuration errors, and verify bytecode/expected interface before an adapter becomes executable.

### M-03 — Authentication, authorization, and abuse controls are absent

**Severity:** Medium now; High if remotely hosted

There are no guards, OAuth module configuration, wallet-to-user binding, scopes, rate limits, middleware, or audit interceptors. The current transport is STDIO, reducing remote exposure. If changed to HTTP/dual, sensitive tools would be reachable without project-level authorization.

The startup also logs a large provider-instantiation error because `OAuthModule` is discovered without `OAUTH_CONFIG`, even though the server continues.

**Fix:** Keep STDIO/local for the hackathon. Before hosting, configure OAuth 2.1 with issuer/audience/signature verification and least-privilege scopes; add wallet binding and per-user rate limits. Investigate the NitroStack OAuth provider-resolution log so startup is clean and health status is trustworthy.

### M-04 — MCP safety annotations and output schemas are absent

**Severity:** Medium

No tool declares `annotations` such as read-only/destructive/idempotent/open-world hints, and no tool supplies an `outputSchema`. No guards, exception filters, rate limits, or caching policies are applied.

**Fix:** Accurately annotate all tools, especially preparation/verification; enforce output schemas; add consistent structured error mapping; and rate-limit expensive live reads. Metadata is not authorization, but it improves client behavior and reviewability.

### M-05 — Receipt storage and audit history are process-local and mutable

**Severity:** Medium for production, acceptable for hackathon if disclosed  
**Location:** `src/modules/shared/receipt.repository.ts`

Receipts disappear on restart, share one global map across all callers, have no authenticated ownership checks, and are mutable objects returned by reference. There is no retention policy, append-only audit log, encryption, or concurrency/version handling.

**Fix:** For the hackathon, disclose reset behavior and bind access to wallet/user. Clone/freeze stored records. For production, use a durable database with append-only events, access control, encryption, backups, and retention policy.

### M-06 — Error handling and availability controls are thin

**Severity:** Medium

RPC calls have no explicit timeout, retry/backoff, circuit breaker, or provider fallback. Responses for failed chains omit observed timestamp/provenance and do not conform to the declared `ChainWalletResultSchema`. Tool methods mix thrown errors and ad hoc `{status, errorCode}` results. Internal exception messages may be returned/logged directly.

**Fix:** Add bounded RPC timeouts, one controlled retry, structured typed error unions, consistent exception filters, and sanitized logs. Preserve fail-closed behavior without hanging an agent run.

### M-07 — External image URLs and widget CSP are uncontrolled

**Severity:** Medium/Low  
**Location:** `discovery.tools.ts:308-311`; dashboard image rendering

Selected opportunity data controls an `<img src>`, and hard-coded Unsplash URLs cause third-party requests. No `@Widget` CSP/domain restrictions exist. This can leak viewer metadata and becomes more problematic when candidates are untrusted.

**Fix:** Bundle local protocol assets or allowlist a minimal image domain through widget CSP; validate image URLs; never accept arbitrary schemes/domains from tool output.

### M-08 — Documentation/configuration is incomplete and misleading

**Severity:** Medium for demo/deployment readiness

- `README.md` describes a calculator starter, not ProofYield.
- Root package description and widget package name retain calculator text.
- `widget-manifest.json` contains calculator examples.
- `.env.example` omits every RPC/token/protocol variable required by `idea-brief.txt`.
- `.env.example` says transport defaults to dual in production, while the app starts as STDIO unless transport/OAuth is explicitly configured.
- `src/index.ts` also claims production dual transport, but current app metadata has no such configuration.
- `system_getStatus` labels the phase `Production-Ready Testnet Agent` despite the missing/broken path.
- Required `PROJECT_CONTEXT.md` is absent.

**Fix:** Rewrite the compact handoff docs, include empty required variables and exact manual tests, state which adapters are simulated/unconfigured, and use an honest phase such as `Hackathon Prototype — Advisory/Planning` until execution is real.

### M-09 — Generated build artifacts and repository baseline are unmanaged

**Severity:** Medium/Low

`dist`, `src/widgets/.next`, and `src/widgets/out` are not ignored. The repository has no `HEAD` commit, while the project files are staged as an initial state. This prevents reliable change review and makes generated `.next` output dominate status/diffs.

**Fix:** Establish a reviewed initial commit, ignore `.next` and normally `dist`/generated widget output unless NitroCloud specifically requires committed artifacts, and generate them in CI/release packaging.

### L-01 — Placeholder resources/prompts remain registered

**Severity:** Low functionally, High for presentation  
**Location:** discovery/planning resource and prompt files

Two `example` resources and two `*-help` prompts contain TODO descriptions and content. These visibly expose unfinished starter material to judges/clients.

**Fix:** Replace them with the single required capabilities resource and treasury workflow prompt, or unregister the placeholders.

### L-02 — Code quality permits schema drift

**Severity:** Low/Medium

There is extensive `any`, manual object assembly, unused imports/types (`SimulationResult`), duplicated environment access, duplicated frontend/backend interfaces, and casts that intentionally bypass types. Schemas declare one shape while runtime returns another.

**Fix:** Parse at boundaries, derive frontend contracts from shared types where feasible, remove dead imports, and make invalid states unrepresentable instead of casting `as any`.

### L-03 — Health check is not a meaningful production readiness check

**Severity:** Low  
**Location:** `src/health/system.health.ts`

It checks only heap-used/heap-total ratio, not configured RPC/provider reachability, adapter readiness, event-loop lag, memory limit/RSS, or receipt store health. It exposes PID and Node version in health details, which is unnecessary for a public endpoint.

**Fix:** Keep a shallow liveness check and add a separate readiness check for configured dependencies; avoid excessive environment details on unauthenticated endpoints.

### L-04 — Encoding and naming remnants reduce polish

**Severity:** Low

Several files/output strings show mojibake (`âš ï¸`, `âœ“`, etc.), root comments still say Calculator, and naming conventions are inconsistent. This will be visible in logs, warnings, README, and potentially the widget.

**Fix:** Normalize files to UTF-8, replace starter comments/metadata, and use one tool naming convention.

## 7. MCP Trust Gateway assessment

The idea’s strongest proposed innovation is currently mostly absent.

| Gateway control from IDEA.md | Current state |
|---|---|
| Tool allowlisting/versioning | NitroStack registers known local tools, but there is no explicit capability/version policy. |
| Schema pinning/hashing | Schemas exist but are not enforced on key inputs/outputs; schema hashes do not exist. |
| Permission classification | No tool annotations or scopes. |
| Source provenance | Present in some data, but incomplete, caller-forgeable, and sometimes falsely labeled. |
| Freshness validation | Partial and fail-open. |
| Output sanitization | No explicit gateway/sanitizer; current opportunity fields are mostly internal constants. |
| Address validation/registry | Missing on planning/execution path. |
| Read/execution separation | Separate classes/modules do not exist as a security boundary; same server and no guards. One-server scope is acceptable, but logical enforcement is still required. |
| Audit logging | Basic operational logs only; no structured per-decision tool timeline or append-only audit record. |
| Fail closed | Some adapter statuses fail closed, but missing provenance, missing simulation, invalid verification, and arbitrary targets do not. |

This means the project should not yet market the Trust Gateway as implemented. It can be described as the architecture being demonstrated, with specific implemented controls called out honestly.

## 8. UI/UX assessment against IDEA.md

The dashboard successfully shows a recommendation card, selected APY, allocation amount, some score components, policy text, rejection reasons, prepared-transaction warning, and receipt hash. It handles light/dark theme and has a clean compact style.

Missing or incomplete UI requirements:

- wallet connection/onboarding;
- policy preset/custom editor and approval-mode selection;
- current three-chain portfolio;
- configuration status;
- block number/data freshness/source confidence;
- opportunity count, eligible alternatives, and `DO_NOTHING` comparison;
- expected net return over a horizon versus raw APY;
- risk classification and assumptions;
- estimated cost and state diff;
- simulation status and policy-check count;
- human-readable multi-action approval plan;
- spender/exact approval amount;
- wallet signing/submission;
- transaction/final balances and expected-vs-actual deltas;
- verification/postcondition status;
- monitoring/risk-change/rebalance story;
- tool-call timeline;
- responsive mobile layout (the main grid is always two columns);
- reduced-motion/touch/accessibility helpers;
- error/retry states rather than indefinite “Loading.”

The most important UI task is not adding visual complexity. It is connecting one reliable end-to-end story and showing the safety evidence clearly.

## 9. Build, runtime, and security test evidence

| Check | Result |
|---|---|
| Root `npm run build` | **Pass.** NitroStack bundled 1 widget and compiled TypeScript. Initial sandbox run was denied directory access; the approved unrestricted rerun passed. |
| Widget `npm run build` | **Pass.** Next.js 14.2.35 compiled, type-checked, and generated `/proofyield-dashboard`; webpack cache emitted non-fatal snapshot warnings. |
| `npx tsc --noEmit --pretty false` | **Pass.** |
| Root `npm ls --all --depth=1` | **Pass.** No invalid required dependency reported; optional React peers for root ext-apps are unmet but React lives in the widget package. |
| Root production `npm audit` | **Pass: 0 known vulnerabilities.** |
| Widget production `npm audit` | **Fail: 2 findings.** 1 High Next.js, 1 Moderate PostCSS. |
| Server startup smoke test | **Starts.** Registers 7 tools, 2 application resources, 2 prompts, health/widget resources; remains alive as expected for STDIO. Logs an OAuth provider-resolution error. |
| Live Base Sepolia snapshot | **Pass.** Returned a current Base block and native/USDC balance for a test address through the configured RPC. No secret endpoint was printed. |
| Current Base opportunity scan | **Only baseline works.** Aave is `NOT_CONFIGURED`; `DO_NOTHING` is live. |
| Adversarial plan/preparation | **Unsafe behavior reproduced.** Invalid wallet, arbitrary protocol/target, huge amount, and violated policy were accepted and prepared. |
| Adversarial verification | **Unsafe behavior reproduced.** Invalid transaction hash/wrong chain returned `SUCCESS`. |
| Receipt schema validation | **Fail.** Runtime receipt did not satisfy `DecisionReceiptSchema`. |
| Hash collision test | **Fail.** Two distinct payloads produced `0x6053226c`. |
| Automated tests/lint/CI | **Absent.** |
| Real transaction/signature/postcondition test | **Not run and not safely runnable.** No valid adapter/simulation/signing implementation exists. |
| Visual host test in NitroStudio | **Not performed.** Static linkage analysis already found manifest/decorator mismatch. |

## 10. Production-level gaps beyond the hackathon

These should not all be built before the hackathon, but they are required before handling real BFSI data/assets:

1. Independent threat modeling and smart-contract/security audit.
2. Strong identity, OAuth 2.1, wallet ownership proof, RBAC/scopes, tenant isolation, and session revocation.
3. Durable append-only receipt/audit storage with encryption, backup, retention, and privacy controls.
4. Reliable multi-provider RPC/data sources, timeouts, circuit breakers, reconciliation, and incident handling.
5. Versioned protocol/address/ABI registries with controlled updates, bytecode/proxy monitoring, and quarantine controls.
6. Proper transaction state machines, idempotency, replay protection, expiry, exact allowances, and emergency pause.
7. Deterministic policy/scoring libraries with invariant/property tests and formalized rounding/unit rules.
8. CI gates for build, lint, tests, dependency/license/secret scanning, SBOM, reproducible artifacts, and signed releases.
9. Observability: request IDs, structured tool audit trail, metrics, traces, alerting, SLOs, and redaction.
10. Legal/regulatory review for investment advice, custody, disclosures, data protection, sanctions/AML obligations, and jurisdictional availability.
11. Accessibility, responsive UI, localization/time handling, browser-wallet threat modeling, and user-support/error recovery.
12. Economic and adversarial testing against oracle changes, protocol upgrades, gas spikes, stale quotes, liquidity loss, and partial execution.

## 11. Pragmatic remediation plan

### P0 — Before showing execution to judges

These are non-negotiable if the demo claims simulation/execution/verification.

1. **Stop false success immediately.** Disable `execution_verify` until it performs a real receipt and postcondition read.
2. **Implement `plan_simulate`.** A no-op simulation for `DO_NOTHING`; real `simulateContract`/gas estimation for one configured adapter.
3. **Create one trusted Base Sepolia adapter.** Use a verified registry and viem ABI encoding; do not take target/selector/calldata from opportunity input.
4. **Enforce the visible policy.** At minimum: valid wallet/address/chain, asset, balance, liquid reserve, maximum allocation, allowed protocol, provenance/freshness, meaningful improvement, and manual approval state.
5. **Make preparation require a passing stored simulation.** Add plan deadline, nonce, chain/wallet binding, and replay/consumption state.
6. **Replace the hash.** Use canonical SHA-256/Keccak-256 and validate the complete receipt schema.
7. **Connect the widget.** Correct the manifest, use `@Widget`, replace TODO resource/prompt, and show simulation/verification truthfully.
8. **Fix the pitch/docs.** Replace calculator metadata/README and remove “Production-Ready” until the evidence supports it.
9. **Add a narrow invariant test suite.** Prioritize the reproduced bypasses in this report.

### P0 alternative — If time is very short

Ship an **honest advisory-only demo**:

- keep live portfolio read;
- use clearly labeled controlled/simulated opportunities;
- enforce policy and show rejected alternatives;
- produce a recommendation receipt with a real cryptographic hash;
- remove/disable prepare and verify tools;
- explicitly say wallet execution is the next integration.

This is less flashy, but much safer and more credible than fabricated execution. It still demonstrates the MCP-native policy and decision-proof innovation.

### P1 — Strong hackathon differentiators

1. Add one controlled risk flag/APY-change fixture and a `monitor_check` tool that proposes—never auto-executes—a rebalance.
2. Show a tool-call timeline in the widget.
3. Return eligible alternatives and counterfactual explanations.
4. Add a small Decision Receipt export/view with provenance, policy gates, simulation, and real transaction link.
5. If a reliable verified Aave Base Sepolia adapter cannot be completed, use a controlled ERC-4626 test vault and label every simulated datum honestly.

### P2 — After the hackathon

Add hosted authorization, persistent storage, multi-provider data, smart-contract policy/receipt registry, incident controls, full CI/security scanning, and the production items in section 10. Keep CCTP/cross-chain as a later extension only after the single-chain state machine is reliable.

## 12. Recommended hackathon positioning

### What can be claimed after current evidence

- ProofYield is built as a NitroStack MCP application.
- It can read Base Sepolia wallet and test-USDC state live.
- It models policy-driven eligibility, transparent scoring, rejected alternatives, `DO_NOTHING`, typed plans, and Decision Receipts.
- It has a compilable interactive dashboard asset.
- It demonstrates a serious architecture for an MCP trust gateway and auditable treasury decision flow.

### What must not currently be claimed

- live Aave/vault APY discovery;
- implemented Trust Gateway enforcement;
- passing plan simulation;
- wallet approval/signature;
- valid supply/deposit transaction preparation;
- submitted testnet execution;
- real transaction/postcondition verification;
- cryptographically verifiable receipts;
- monitoring/rebalancing;
- production readiness.

### Best judge narrative

Lead with the problem that BFSI automation needs bounded permissions and auditability, not an APY chatbot. Show a live wallet read, a controlled candidate set with honest provenance labels, deterministic gates, rejected alternatives, and a receipt. If P0 is completed, finish with one real simulated and signed testnet action plus verified postconditions. If not, stay advisory-only and explicitly explain that refusing unsafe execution is itself part of the product design.

## 13. Final assessment

The product has serious potential in the fintech/BFSI track because its differentiators—policy as an enforceable constitution, counterfactual rejection evidence, an MCP trust boundary, and Decision Receipts—map directly to institutional concerns around authorization, explainability, auditability, and operational control.

The current repository proves the feasibility of the shell, live portfolio reading, and basic decision UX. It does not yet prove the central safety or execution claims. The fastest credible path is a narrow Base Sepolia or controlled-vault flow with real schema validation, real policy enforcement, real simulation, real ABI encoding, real wallet approval, real verification, and a real cryptographic receipt. Everything else can remain clearly labeled as future architecture.

**Overall:** promising concept, compilable prototype, not currently safe or complete enough for an execution demo, and not production-ready.
