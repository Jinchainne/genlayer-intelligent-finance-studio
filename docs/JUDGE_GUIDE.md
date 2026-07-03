# Judge Guide

## Live Product

- App: https://genlayer-intelligent-finance-studio.vercel.app
- Repo: https://github.com/Jinchainne/genlayer-intelligent-finance-studio
- Main panel to inspect: `GenLayer Intelligence -> GenLayer Contract`

## GenLayer Contract

- Network: `studionet`
- Contract: `GenLayerFinancePolicy`
- Address: `0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20`
- Deployment tx: `0x0da0ec6a5f82e76cdbcfdf8e82b485af352e6c73e2b0f4e82c60847af8f0152e`

Verified reads:

```bash
npx genlayer call 0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20 project
npx genlayer call 0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20 counters
```

Expected results:

```text
GenLayer Intelligent Finance Studio
reports=0;signals=0;policy_checks=0
```

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
