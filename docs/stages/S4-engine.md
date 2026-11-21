# S4 — Deterministic readiness evaluator

**Stage outcome:** Pure typed domain engine, scoring intervals, gates and budget fit.

## Bounded execution scope
evaluate(), path precedence, action selection, explicit unknown/budget handling, no score imputation.

## Deliverables
Unit/property test evidence, fixture expected-versus-actual diff, decision trace.

## Non-goals and disallowed shortcuts
No unexplained scoring changes; budget cannot influence maturity; do not auto-rewrite golden cases. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Verification
Every critical fixture and property invariant passes; independent false-safe audit.

## Product requirements

Core score remains existing 14 anchors and integer interval. Extended AWS-style questions create deterministic findings and existing action suggestions, not a second score. Budget never changes score. Include cross-module regression fixtures and inconsistency checks.
