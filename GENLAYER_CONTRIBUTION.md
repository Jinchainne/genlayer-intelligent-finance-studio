# GenLayer Contribution Plan

This document explains how the inherited QuyNhon dashboard becomes a GenLayer contribution.

## Design Principle

Do not put private keys or trade execution custody into the intelligent contract layer first.

Instead, use GenLayer for:

- market signal attestations
- AI report provenance
- risk-policy decisions
- transparent records that the frontend can display

## Contract 1: Finance Signal Attestation

Purpose:

- record that a market signal was generated from a known set of sources
- preserve timestamp, symbol, direction, risk score, and rationale hash
- allow the UI to display accepted/rejected status

Inputs:

- `symbol`
- `direction`
- `source_refs`
- `rationale_hash`
- `risk_score`
- `created_at`

Policy:

- reject missing source references
- reject invalid risk score range
- reject stale timestamps
- store accepted signal records

## Contract 2: AI Report Registry

Purpose:

- register AI-generated report metadata
- connect report hash to prompt class, model family, source references, and timestamp

Inputs:

- `report_hash`
- `prompt_class`
- `source_refs`
- `model_family`
- `created_at`

Policy:

- reject reports without sources
- reject empty hashes
- expose report history by user/account

## Contract 3: Trade Intent Guard

Purpose:

- record whether a proposed trade intent passed policy before execution
- keep execution in the existing SoDEX/local bot workflow

Inputs:

- `market`
- `product`
- `side`
- `notional`
- `leverage`
- `risk_score`
- `source_signal_id`

Policy:

- reject leverage above configured limit
- reject notional above configured limit
- reject high-risk score unless explicitly marked review-only

## Frontend Integration Plan

Add contract-aware panels:

- GenLayer Attestations
- AI Report Registry
- Trade Intent Guard
- Contract Health

Each panel should show:

- contract address
- latest records
- pending write status
- readable explanation of accepted/rejected decisions

## Testing Plan

Follow the GenLayer project boilerplate pattern:

- direct mode tests for contract logic
- mocked web/LLM responses for market data and report classification
- integration tests against GenLayer Studio before final submission

## Submission Checklist

- README explains the GenLayer path
- portal submission links to repo
- first contract file added
- direct tests pass
- Studio deployment screenshot added
- frontend reads at least one contract view method
