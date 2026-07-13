# Judge Guide

## Live Product

- App: https://genlayer-intelligent-finance-studio.vercel.app
- Repo: https://github.com/Jinchainne/genlayer-intelligent-finance-studio
- Main panel to inspect: `GenLayer Intelligence -> GenLayer Contract`

## GenLayer Contract

- Network: `studionet`
- Contract: `GenLayerFinancePolicy`
- Address: `0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC`
- Deployment tx: `0xf59cd494af7ecdbdc35ea6ac09c3dd3fdbe19515b2e3689c1a49bf97e8b7e0a1`

Verified reads:

```bash
npx genlayer call 0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC project
npx genlayer call 0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC counters
```

Expected result shape:

```text
GenLayer Intelligent Finance Studio
reports=<number>;signals=<number>;policy_checks=<number>
```

`policy_checks` should increase after the app submits a contract-bound policy review.

## Live API Checks

```bash
curl https://genlayer-intelligent-finance-studio.vercel.app/api/health
curl https://genlayer-intelligent-finance-studio.vercel.app/api/news
curl https://genlayer-intelligent-finance-studio.vercel.app/api/signals
```

The production app is configured with Groq, source-feed adapters, execution-adapter guards, Telegram command forwarding, and GenLayer contract metadata. Secrets are held in Vercel Environment Variables and are not committed to this repository.

## What To Evaluate

- Practical user value: live finance workspace, AI provenance, signal ranking, policy-intent workflow.
- GenLayer fit: deployed Python intelligent contract, consensus-verified state, non-custodial policy layer.
- Working demo: live Vercel app, live source feed, Groq AI response, Telegram bridge, verified Studionet reads.
- Product clarity: judges can inspect the contract panel, API health, README, and submission draft without running local code.
