# ProofYield MCP

ProofYield is a testnet-only, non-custodial DeFi treasury prototype. It turns a natural-language intent into a typed policy, reads a wallet, researches only configured protocol adapters, rejects unsafe candidates, ranks the rest, simulates an exact transaction, asks the connected wallet to sign, verifies the result on-chain, and records a hash-bound Decision Receipt.

It is deliberately narrow for the hackathon: test USDC, Base/Ethereum Sepolia or Polygon Amoy, Aave V3 when an official testnet deployment is configured, and a controlled ERC-4626 demo vault.

## Where the “brain” lives

The MCP host's language model (for example ChatGPT/OpenAI Apps or NitroStudio's configured model) is the conversational reasoning brain. It interprets the user's prompt, chooses the typed ProofYield tools, and explains the result. MCP itself is the protocol connecting that model to these capabilities.

ProofYield's deterministic backend is the authorization brain. It—not the LLM—validates schemas, chain and contract allowlists, freshness, balances, concentration and risk limits, calculates scores, creates calldata through fixed adapters, requires a passing simulation, and verifies the signed transaction. Codex is used to build the project and is not a runtime dependency.

## Implemented workflow

1. `system_getStatus` opens the interactive treasury console and reports readiness.
2. `portfolio_getSnapshot` reads live native/test-USDC balances with chain/block provenance.
3. `opportunities_scan` reads configured Aave data, exposes a clearly labeled controlled vault scenario, and includes a do-nothing baseline.
4. `strategy_createPlan` applies hard policy gates before deterministic scoring and emits rejected alternatives.
5. `plan_simulate` simulates either an exact approval or the protocol action against live chain state.
6. `execution_prepare` returns only the unsigned transaction bound to the unexpired simulation.
7. The browser wallet signs and broadcasts; the MCP server never receives a seed phrase or private key.
8. `execution_verify` binds the on-chain receipt and postconditions to the plan.
9. `receipt_get` returns the complete Decision Receipt; `monitor_check` can recommend, but never automatically execute, a rebalance.

## Quick start

Requirements: Node.js 20+, npm, a browser wallet on a supported testnet, and free test tokens.

```bash
copy .env.example .env
npm install
npm --prefix src/widgets install
npm run check
npm run dev
```

Fill only the environment values you can verify from official issuer/protocol documentation. An adapter remains visibly `NOT_CONFIGURED` until its RPC, token, and contract registry entries are complete; ProofYield does not invent fallback addresses or rates.

Open the `system_getStatus` tool in an MCP Apps-compatible host to render `/proofyield-dashboard`. Connect the wallet, enter an amount and intent, then run research. If no executable adapter is configured, the product still demonstrates live wallet reads, policy evaluation, reject reasons, and the safe do-nothing path without pretending execution is available.

## Controlled vault demo

`contracts/MockYieldVault.sol` is a dependency-free, testnet-only ERC-4626-compatible vault. The current Base Sepolia deployment is [`0xFE681843b29d7eB197F3187B1e6fa228B09A21d7`](https://sepolia.basescan.org/address/0xFE681843b29d7eB197F3187B1e6fa228B09A21d7); its reproducible deployment metadata is in `deployments/base-sepolia.json`. `DEMO_VAULT_APY_BPS` and `DEMO_VAULT_RISK_SCORE` drive a visibly labeled controlled scenario for the monitoring story; they are not market data. Sending extra test USDC directly to the vault increases assets-per-share and provides a simple, honest yield demonstration.

The repository also includes a checksum-verified project-local Foundry workflow. Import a dedicated testnet deployer into an encrypted keystore with `.tools\foundry\v1.7.1\cast.exe wallet import proofyield-deployer --interactive`, then run `.\scripts\deploy-vault.ps1`. Both commands prompt locally; never place a private key in `.env` or chat.

## Security boundaries

- Testnets only; no real assets and no financial-advice claim.
- Exact approvals, fixed function selectors, server-side targets, short deadlines, and manual signatures.
- Cryptographic SHA-256 canonical hashes bind snapshots, policies, plans, simulations, and receipts.
- No caller-provided calldata, contract address, RPC URL, private key, or raw signed transaction.
- Missing/stale data, unconfigured adapters, failed simulations, chain mismatches, replayed transactions, and postcondition failures fail closed.
- Rate limits are intentionally generous for a small demo while protecting free public RPCs.
- Optional local receipt persistence is suitable for the hackathon only. A hosted multi-user product needs a user-scoped database, OAuth 2.1 with least-privilege scopes, HTTPS, centralized audit logs, and an independent smart-contract/security review.

## Commands

```bash
npm run typecheck   # backend and widget types
npm test            # production build plus security-focused tests
npm run check       # full local gate
npm run smoke:live  # read configured testnets without moving funds
npm run dev         # development MCP server
npm start           # build and start
```

The original product specification is in `IDEA.md`; the pre-remediation audit is in `report.md`.
