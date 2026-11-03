# S4 — Deterministic readiness evaluator

**Stage outcome:** Pure typed domain engine, scoring intervals, gates and budget fit.

## Inputs and prior approvals
S3 approved; independent golden fixtures approved S1. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
evaluate(), path precedence, action selection, explicit unknown/budget handling, no score imputation. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Unit/property test evidence, fixture expected-versus-actual diff, decision trace. Create `docs/handoffs/S4-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
No unexplained scoring changes; budget cannot influence maturity; do not auto-rewrite golden cases. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
Every critical fixture and property invariant passes; independent false-safe audit. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Core score remains existing 14 anchors and integer interval. Extended AWS-style questions create deterministic findings and existing action suggestions, not a second score. Budget never changes score. Include cross-module regression fixtures and inconsistency checks.
