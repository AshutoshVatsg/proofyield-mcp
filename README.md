# ProofYield MCP 

**An Enterprise-Grade Model Context Protocol (MCP) Server for Verifiable DeFi Yield Discovery and Algorithmic Portfolio Planning.**

---

## Overview

**ProofYield MCP** bridges the gap between Large Language Models (LLMs) and decentralized finance by providing AI agents with standardized, secure tools to discover yield opportunities, formulate execution plans, and verify cryptographic proof-of-work receipts. Built on top of the **Model Context Protocol (MCP)**, it acts as a modular middleware pipeline that enables assistants (such as Claude, Cursor, and custom agents) to interact safely with blockchain yield protocols.

### Key Features

-  **Discovery Engine:** Query real-time, risk-adjusted yield opportunities across decentralized protocols using standardized MCP tools.
-  **Algorithmic Planning:** Generate multi-step, risk-mitigated DeFi allocation strategies and execution paths tailored to user parameters.
-  **Cryptographic Receipts & Evidence Tracking:** Every discovery and planning action generates auditable proof receipts and evidence logs stored in persistent repositories.
-  **Hardened Auth & Security Pipeline:** Built-in middleware for request validation, authentication, and secure interaction modeling.
-  **Interactive UI Widgets:** Embedded modern frontend components (built with Next.js & React) designed to render rich DeFi dashboards directly inside MCP-client chat interfaces.
-  **Smart Contract Integration:** Includes Solidity smart contracts (e.g., `MockYieldVault`) deployed and tested using Foundry for on-chain verification and simulation.

---

##  Architecture & Project Structure

The project is structured into modular layers with clear separation between MCP protocol handling, core business logic, on-chain contracts, and frontend widget rendering:

```text
proofyield-mcp/
├── contracts/                  # Solidity smart contracts & Foundry suites
│   ├── MockYieldVault.sol      # Mock yield vault for testing & simulation
│   └── test/                   # Foundry test cases (.t.sol)
├── deployments/                # Chain deployment artifacts (e.g., Base Sepolia)
├── scripts/                    # Automation, deployment, and testing scripts
│   ├── deploy-vault.ps1        # PowerShell script for vault contract deployment
│   ├── dev-browser.mjs         # Helper to launch UI widgets in browser dev mode
│   └── live-smoke.mjs          # Smoke testing script against live/test environments
├── src/                        # Core TypeScript MCP Server Application
│   ├── app.module.ts           # Root application module defining DI & bootstrapping
│   ├── index.ts                # Application entry point
│   ├── health/                 # Health check endpoints and system monitoring
│   ├── modules/                # Domain specific feature modules
│   │   ├── discovery/          # Yield opportunity discovery (Tools, Prompts, Resources)
│   │   ├── planning/           # Strategy planning (Tools, Prompts, Resources)
│   │   └── shared/             # Shared services, schemas, & repositories
│   │       ├── config.service.ts       # Environment & configuration management
│   │       ├── evidence.repository.ts  # Persistence layer for audit/evidence logs
│   │       ├── receipt.repository.ts   # Persistence layer for proof-of-work receipts
│   │       └── schemas.ts              # Zod / data validation schemas
│   └── widgets/                # Next.js frontend widgets for MCP UI rendering
│       ├── app/                # Next.js App Router (Dashboard pages & layouts)
│       ├── lib/                # Browser MCP client utilities
│       └── out/                # Static HTML exports for UI embeds
├── tests/                       # Integration and security test suites
│   └── core-security.test.mjs  # Core auth & security validation tests
├── foundry.toml                 # Foundry configuration for smart contracts
├── package.json                 # Node.js dependencies & NPM scripts
└── tsconfig.json                # TypeScript compiler configuration
```

---

##  Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js:** v18.x or v20.x (LTS recommended)
- **Package Manager:** npm, pnpm, or yarn
- **Foundry:** Required for smart contract compilation and testing (`forge`, `cast`, `anvil`)
- **Git:** For version control and submodule management

---

##  Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/proofyield-mcp.git
cd proofyield-mcp
```

### 2. Install Dependencies

Install the root server dependencies as well as the UI widget dependencies:

```bash
# Install root MCP server dependencies
npm install

# Install Next.js UI widget dependencies
cd src/widgets && npm install && cd ../..
```

### 3. Environment Configuration

Copy the example environment file and configure your local variables:

```bash
cp .env.example .env
```

Open `.env` and configure your RPC URLs, private keys (for testnets), and MCP server port configurations.

### 4. Build the Project

Compile the TypeScript server, build the frontend UI widgets, and compile the Foundry smart contracts:

```bash
# Build the TypeScript MCP server
npm run build

# Build the Next.js UI Widgets
cd src/widgets && npm run build && cd ../..

# Compile Solidity contracts using Foundry
forge build
```

---

## Running the Application

### Development Mode

Run the MCP server locally with hot-reloading enabled for rapid development:

```bash
npm run dev
```

To test or develop the interactive UI widgets in your browser, launch the widget dev server:

```bash
node scripts/dev-browser.mjs
```

### Production Mode

To run the compiled production server:

```bash
npm start
```

---

## MCP Modules & Core Capabilities

The server exposes two primary AI-facing modules via the Model Context Protocol:

### 1. Discovery Module (`/src/modules/discovery`)

- **Tools** (`discovery.tools.ts`): Allows agents to query yield vaults, filter by APY/TVL, and assess smart contract risk scores.
- **Resources** (`discovery.resources.ts`): Exposes live feeds of verified protocol metrics.
- **Prompts** (`discovery.prompts.ts`): Pre-configured system prompts that instruct LLMs on how to analyze yield data objectively without hallucinating APYs.

### 2. Planning Module (`/src/modules/planning`)

- **Tools** (`planning.tools.ts`): Provides algorithmic step-by-step route generation for capital allocation (e.g., Bridge → Swap → Stake → Deposit).
- **Resources** (`planning.resources.ts`): Access to historical execution strategies and gas optimization models.
- **Prompts** (`planning.prompts.ts`): Guides agents in presenting risk-adjusted financial strategies and requesting user confirmation before execution.

### 3. Shared Evidence & Receipt Repositories

Every action taken by the Discovery and Planning modules is cryptographically recorded:

- **`receipt.repository.ts`:** Stores verifiable proof-of-work receipts for completed tool calls.
- **`evidence.repository.ts`:** Maintains audit logs and data snapshots used to justify AI recommendations.

---

## Smart Contracts & Blockchain Layer

The `/contracts` directory contains the on-chain components powering ProofYield:

- **`MockYieldVault.sol`:** An ERC-4626 compatible mock yield vault used to simulate staking, yield generation, and withdrawal flows on testnets (e.g., Base Sepolia).

### Deploying Contracts

Use the provided deployment scripts or Foundry directly:

```bash
# Deploy using Foundry (example for Base Sepolia)
forge script contracts/deploy/Deploy.s.sol:Deploy --rpc-url $BASE_SEPOLIA_RPC --broadcast

# Or use the provided automation script
./scripts/deploy-vault.ps1
```

---

## Testing & Verification

We enforce strict test coverage across smart contracts, server logic, and security pipelines.

### Run Smart Contract Tests (Foundry)

Execute the Solidity test suite to verify vault mechanics and math:

```bash
forge test -vvv
```

### Run Server & Security Tests

Run the Node.js test suites to validate middleware pipelines, authentication guardrails, and tool execution:

```bash
# Run core security and authentication tests
node tests/core-security.test.mjs

# Execute a live smoke test against running endpoints
node scripts/live-smoke.mjs
```

---

## Agent & IDE Integration

ProofYield MCP includes pre-configured agent skill profiles and configuration rules for major AI coding assistants and environments.

**Claude / Cursor / Copilot / Gemini / OpenCode:** Check the `.agents/`, `.claude/`, `.cursor/`, and `.gemini/` directories for specialized `SKILL.md` instructions covering:

- **auth-security:** Best practices and rules for authentication and key management.
- **mcp-app-architecture:** Guidelines on extending modules and tools.
- **middleware-pipeline:** How to inject custom interceptors and logging into request lifecycles.
- **ui-widgets:** Instructions for building and embedding Next.js widgets into chat streams.

To connect this server to your local MCP client (e.g., Claude Desktop), add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "proofyield": {
      "command": "node",
      "args": ["/absolute/path/to/proofyield-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

---

---
