# GenLayer Intelligent Finance Studio

GenLayer Intelligent Finance Studio is a GenLayer contribution project that turns a live finance interface into a verifiable decision layer for the GenLayer ecosystem.

The repo demonstrates how a frontend can collect live market context, route intent through AI-assisted policy workflows, and anchor the important parts of that flow in a deployed GenLayer intelligent contract on Studionet.

## What This Project Does

- Presents a GenLayer-branded finance workspace for live context, policy review, and execution-aware workflows.
- Connects the UI to a deployed Python intelligent contract.
- Verifies report provenance, signal attestation, and trade-intent policy checks.
- Exposes the contract state and deployment metadata directly in the product UI.
- Keeps local runtime automation separate from the on-chain verification layer.

## Why It Belongs In GenLayer

GenLayer is built around intelligent contracts that reason over context, not just raw transaction state. This project fits that model because it:

- uses live web and market context as inputs
- applies policy checks before action
- records verifiable decisions in a deployed contract
- gives judges a working product surface instead of a static demo

## Live Demo

- App: https://genlayer-intelligent-finance-studio.vercel.app
- GitHub: https://github.com/Jinchainne/genlayer-intelligent-finance-studio

## Deployed Contract

- Contract: `GenLayerFinancePolicy`
- Network: `studionet`
- Studio RPC: `https://studio.genlayer.com/api`
- Address: `0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC`
- Deployment tx: `0xf59cd494af7ecdbdc35ea6ac09c3dd3fdbe19515b2e3689c1a49bf97e8b7e0a1`

Verified reads:

```bash
npx genlayer call 0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC project
npx genlayer call 0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC counters
```

Expected output shape:

```text
GenLayer Intelligent Finance Studio
reports=<number>;signals=<number>;policy_checks=<number>
```

`policy_checks` increases whenever the bound execution workflow writes a policy decision to the contract.

## Product Surface

- GenLayer overview
- Live market pulse
- Source feed
- AI provenance
- GenLayer contract panel
- Signal attestation
- Asset intent
- Derivative intent
- Intent ledger
- Automation
- Local runtime bridge
- API health
- Security

## Repository Structure

```text
app/                     Next.js app router and API routes
contracts/               GenLayer intelligent contract source
docs/                    judge notes and contribution guidance
public/                  branding assets and screenshots
scripts/                 verification helpers
README.md                project overview
SUBMISSION.md            portal submission draft
GENLAYER_CONTRIBUTION.md build and contribution plan
```

## Local Development

```bash
npm install --legacy-peer-deps
npm run dev
```

Production build:

```bash
npm run build
```

Verification:

```bash
npm run verify:prod
npm run verify:genlayer
```

## Contract Validation

The deployed contract was verified against GenLayer Studionet with the GenLayer CLI. The UI includes a dedicated contract panel so judges can inspect the address, tx hash, and read methods without leaving the app.

## Notes For Reviewers

- The repo is centered entirely on GenLayer.
- Environment secrets are kept in Vercel and are not committed.
- The contract is non-custodial and records policy outcomes rather than handling user funds.
- Local runtime control is intentionally separated from on-chain verification.

## Links

- GenLayer Studio: https://studio.genlayer.com/contracts
- GenLayer Portal: https://portal.genlayer.foundation/submit-contribution
- GenLayer Docs: https://docs.genlayer.com/
- GenLayer GitHub: https://github.com/genlayerlabs
