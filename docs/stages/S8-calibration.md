# S8 — Continuous calibration and maintenance

**Stage outcome:** Use genuine outcome evidence to improve without changing old results.

## Inputs and prior approvals
S7 accepted and privacy-approved feedback process. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
Manual consultant usefulness metrics, support feedback, versioned proposals for rubric and UX. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Release retrospective, revised backlog, versioned ADRs and fixture updates for future stages. Create `docs/handoffs/S8-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
Do not silently reinterpret historical scores; do not claim telemetry not collected. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
Change proposals with cost/risk and test evidence; each accepted change has new scoped stage or PR. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 product calibration

Track validated usefulness of core recommendations and whether the AWS technical extension improves consultant decisions. No aggregate self-reported readiness benchmark without consent and valid sampling.
