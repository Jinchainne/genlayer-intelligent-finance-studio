# GenLayer Contracts

This directory contains the deployed intelligent contract layer for GenLayer Intelligent Finance Studio.

## Deployed Contract

- Contract: `GenLayerFinancePolicy`
- Source: `contracts/genlayer_finance_policy.py`
- Network: `studionet`
- RPC: `https://studio.genlayer.com/api`
- Address: `0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC`
- Deployment tx: `0xf59cd494af7ecdbdc35ea6ac09c3dd3fdbe19515b2e3689c1a49bf97e8b7e0a1`

Verified reads:

```bash
npx genlayer call 0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC project
npx genlayer call 0x1C5973c789E5E6C92eAFE454E2cc70443F9cC3AC counters
```

The contract records AI report provenance, source-backed signal attestations, and trade-intent policy checks. It does not custody user assets or execute trades.
