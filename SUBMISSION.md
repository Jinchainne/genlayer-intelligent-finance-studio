# GenLayer Contribution Submission Draft

## Project Name

GenLayer Intelligent Finance Studio

## Links

Live demo:

```text
https://genlayer-intelligent-finance-studio.vercel.app
```

GitHub:

```text
https://github.com/Jinchainne/genlayer-intelligent-finance-studio
```

## Short Description

A GenLayer finance operator studio that connects live market research, Groq AI reports, trading workflow UX, local runtime monitoring, and a deployed Python intelligent contract for signal attestations, AI report provenance, and trade-intent policy checks.

## Contribution Type

Builder contribution / Chain Studio application / deployed Studionet intelligent contract prototype.

## Problem

AI-assisted trading dashboards often produce recommendations without verifiable provenance. Local trading bots can execute actions, but their decision history is difficult to audit. Users need a way to connect market context, AI reasoning, and policy checks to transparent on-chain records.

## Solution

This contribution turns the QuyNhon finance dashboard into a GenLayer-ready studio:

- the frontend collects and displays market/research context
- AI report workflows produce structured rationale
- local bot controls show real automation events and trade history
- the deployed GenLayer Studionet contract records signal attestations, AI report provenance, and trade intent policy checks

## Why It Matters To GenLayer

GenLayer is strongest when AI, web data, and consensus-style verification meet practical application workflows. This repo uses a real finance workflow to show where intelligent contracts can add value:

- validating off-chain facts
- storing AI report provenance
- checking risk policies
- creating an auditable decision layer before execution

## Deliverables In This Repo

- Next.js product surface copied from QuyNhon and prepared as a new GenLayer repo
- GenLayer-specific README
- contribution submission draft
- deployed contract source and metadata under `contracts/`
- local bot evidence and screenshots retained from the original product
- environment and security notes

## Next Deliverables

- `contracts/finance_signal_attestation.py`
- direct tests for accepted/rejected attestations
- `contracts/ai_report_registry.py`
- `contracts/trade_intent_guard.py`
- integration test notes for GenLayer Studio
- frontend contract address integration

## GenLayer Links

- Studio: https://studio.genlayer.com/contracts
- Portal: https://portal.genlayer.foundation/submit-contribution
- GenLayer GitHub: https://github.com/genlayerlabs

