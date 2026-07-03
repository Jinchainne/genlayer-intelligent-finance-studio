# GenLayer Contracts

This directory contains the deployed intelligent contract layer for GenLayer Intelligent Finance Studio.

## Deployed Contract

- Contract: `GenLayerFinancePolicy`
- Source: `contracts/genlayer_finance_policy.py`
- Network: `studionet`
- RPC: `https://studio.genlayer.com/api`
- Address: `0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20`
- Deployment tx: `0x0da0ec6a5f82e76cdbcfdf8e82b485af352e6c73e2b0f4e82c60847af8f0152e`

Verified reads:

```bash
npx genlayer call 0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20 project
npx genlayer call 0xC7A40b2c5579Fc715C297D9173c14d37Aee95d20 counters
```

The contract records AI report provenance, source-backed signal attestations, and trade-intent policy checks. It does not custody user assets or execute trades.
