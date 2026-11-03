# S3 — Guided assessment and storage

**Stage outcome:** Premium progressive wizard and resilient local user flow.

## Inputs and prior approvals
S2 approved; frozen v1.1 question bank. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
Three-question entry, fourteen anchors, selective probes, preview, review/edit, session draft and opt-in durable save. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Working browser flow, real-device screenshots or findings, Playwright wizard tests. Create `docs/handoffs/S3-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
No scoring-engine shortcuts, no answer network calls, no unrelated rule edits. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
Keyboard, 320px, storage-denied, reset/edit/resume and multi-tab tests pass. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Implement UX-00..UX-12 from product technical spec; three-field start, 5-question preview, 14-core, triggered probes, optional 18 technical deep-dive, discovery context, capacity and budget later. No contact capture before results.
