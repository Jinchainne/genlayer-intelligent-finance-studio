# Contracts

This directory is reserved for GenLayer Python intelligent contracts.

Planned contracts:

```text
finance_signal_attestation.py
ai_report_registry.py
trade_intent_guard.py
```

The first implementation target is `finance_signal_attestation.py`, with direct tests using mocked market/research data.

The goal is not to execute trades from the contract. The goal is to create an auditable intelligence layer that records market signals, AI report provenance, and trade-intent policy checks before an external workflow executes.

