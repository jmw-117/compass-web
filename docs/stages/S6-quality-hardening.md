# S6 — Independent QA and hardening

**Stage outcome:** Defect detection, performance, security and browser audit.

## Inputs and prior approvals
S5 approved with complete integrated code. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
Playwright matrix, axe, real Android/iOS spot checks, fail cases, local storage, dependency and bundle checks. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
QA report and prioritized defect log, release blockers resolved or documented. Create `docs/handoffs/S6-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
No fabricated pass claims; avoid modifying product semantics to make tests pass. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
No critical a11y, privacy or false-safe failures; quality gates pass on clean checkout. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Add test coverage for all 23 product requirements; verify expanded branch conditions, 18 deep option IDs, 14 core inputs, document output, screen-reader behavior, no hidden network submissions.
