# GenLayer Intelligent Finance Studio

GenLayer Intelligent Finance Studio is a GenLayer contribution project derived from the QuyNhon on-chain finance dashboard.

The goal is to turn a live finance operating system into a GenLayer-ready product: a frontend for market research and trading workflows, plus a contribution path for Python intelligent contracts that can validate off-chain finance facts, reason over AI outputs, and produce auditable on-chain decisions through GenLayer Studio.

## Why GenLayer

GenLayer Labs describes itself as an AI research lab building technology for sovereignty, transparency, and decentralization. The official organization highlights `genlayer-studio`, `genlayer-js`, `genlayer-py`, `genlayer-project-boilerplate`, and `genlayer-docs` as core developer resources.

The GenLayer project boilerplate shows the expected shape of a complete contribution:

- Python intelligent contracts under `contracts/`
- direct in-memory tests under `tests/direct/`
- integration tests against GenLayer Studio
- deployment scripts
- a frontend
- contract linting and CI

This repo adapts the QuyNhon finance dashboard into that structure gradually, without pretending the GenLayer contract layer is already deployed.

## What This Repo Contains Now

This initial contribution package includes:

- A Next.js 15 finance dashboard inherited from QuyNhon
- SoDEX market/trading workflow UI
- SoSoValue-style research and AI report workflows
- Local realtime bot bridge UI
- Screenshot-backed README documentation
- A GenLayer contribution plan
- A deployed `contracts/genlayer_finance_policy.py` intelligent contract for provenance, signal attestation, and policy checks
- A submission guide for `portal.genlayer.foundation`

## Live Demo And Repository

```text
Live demo: https://genlayer-intelligent-finance-studio.vercel.app
GitHub: https://github.com/Jinchainne/genlayer-intelligent-finance-studio
```

## Product Concept

Traditional finance dashboards are mostly off-chain and trust-heavy. Trading bots are usually local scripts with weak audit trails. AI reports are rarely linked to verifiable execution decisions.

GenLayer Intelligent Finance Studio explores a better pattern:

1. Collect live market/research context in the dashboard.
2. Ask AI to summarize or classify the situation.
3. Route the decision through a GenLayer intelligent contract design.
4. Use GenLayer consensus/verifiability to record the reasoning result.
5. Keep local bot automation separate and observable.

## Proposed Intelligent Contracts

The deployed GenLayer layer focuses on finance decision verification rather than direct custody.

### 1. Market Signal Attestation

Validates that a submitted signal includes:

- market symbol
- timestamp
- source URLs or API response references
- AI rationale
- risk score
- proposed action

Expected contract behavior:

- reject incomplete attestations
- store accepted signal summaries
- expose read-only signal history
- support test mocks for market/research responses

### 2. AI Report Registry

Stores normalized AI reports generated from live context.

Expected contract behavior:

- accept report hash, prompt class, source list, and timestamp
- require deterministic metadata fields
- optionally use web/LLM equivalence checks for report classification
- allow frontend display of report provenance

### 3. Trade Intent Guard

Does not custody funds. Instead, records whether a proposed trade intent passed policy.

Expected contract behavior:

- validate max notional, leverage, market, direction, and risk threshold
- record approved/rejected status
- make policy results queryable by the frontend

## Current Frontend Modules

- Market Pulse
- News Feed
- Market Intelligence
- AI Reports
- Signals Engine
- Spot Trading
- Futures Trading
- Orders and Positions
- Automation
- Local Trade Bot
- Jinbot Cross Signals
- API Health
- Security

## Local Realtime Bot Bridge

The realtime bot is intentionally local. Vercel/serverless functions are not appropriate for long-running Telegram polling or trade loops.

The web app can talk to the bot through:

- local dashboard API
- secure tunnel such as Cloudflare Tunnel
- optional Telegram workflow

This separation is important for GenLayer too: the local bot executes operational actions, while the deployed intelligent contract layer records and verifies decisions and attestations.

## Repository Structure

```text
app/                     Next.js app router frontend and API routes
contracts/               GenLayer intelligent contract design area
docs/                    screenshots and contribution notes
public/                  product assets
scripts/                 local utility scripts
README.md                GenLayer contribution overview
SUBMISSION.md            portal submission draft
GENLAYER_CONTRIBUTION.md detailed build plan
```

## GenLayer Studio Path

Target Studio URL:

```text
https://studio.genlayer.com/contracts
```

Target contribution portal:

```text
https://portal.genlayer.foundation/submit-contribution
```

Deployed contract workflow:

```text
contracts/
  genlayer_finance_policy.py
  deployment.json
```

Contract deployment:

```text
Network: studionet
RPC: https://studio.genlayer.com/api
Contract: GenLayerFinancePolicy
Address: 0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20
Deployment tx: 0x0da0ec6a5f82e76cdbcfdf8e82b485af352e6c73e2b0f4e82c60847af8f0152e
Verified calls:
  project  -> GenLayer Intelligent Finance Studio
  counters -> reports=0;signals=0;policy_checks=0
```

## Development

Install frontend dependencies:

```bash
npm install --legacy-peer-deps
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## GenLayer Tooling To Add

Based on the official boilerplate, the next repo iteration should add:

```bash
npm install -g genlayer
python -m venv .venv
pip install -r requirements.txt
genvm-lint check contracts/
pytest tests/direct/ -v
gltest tests/integration/ -v -s
```

Those commands are listed here as the target workflow; this repo does not yet vendor GenLayer boilerplate dependencies.

## Contribution Positioning

This is a builder contribution for GenLayer because it connects a real product surface to a deployed intelligent-contract workflow:

- frontend already demonstrates the finance operator workflow
- local automation shows why verifiable decision records matter
- contracts are scoped around attestation, report registry, and policy guard
- GenLayer Studio can be used to prototype those contracts without forcing custody into the first version

## Status

Current status:

- frontend copied and rebranded from QuyNhon
- repo metadata updated for GenLayer
- contribution docs added
- GenLayerFinancePolicy deployed on Studionet at `0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20`

Next milestone:

- add first Python intelligent contract
- add direct tests with mocked market/research data
- expand frontend read/write integration with the deployed GenLayer contract
- add transaction receipts and explorer links for contract writes

## Links

- GenLayer Studio: https://studio.genlayer.com/contracts
- Contribution portal: https://portal.genlayer.foundation/submit-contribution
- GenLayer Labs GitHub: https://github.com/genlayerlabs
- GenLayer repositories: https://github.com/orgs/genlayerlabs/repositories

