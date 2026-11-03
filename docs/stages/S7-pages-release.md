# S7 — GitHub Pages release

**Stage outcome:** Publish only approved build via gated GitHub Actions.

## Inputs and prior approvals
S6 human approval, GitHub Pages commercial policy suitability review, branch/protection checks. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
Merge on main, Actions publication, live HTTPS/base-path smoke and rollback rehearsal. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Live URL and SHA evidence, workflow run proof, release log, rollback instructions. Create `docs/handoffs/S7-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
Do not call a local preview production; do not violate GitHub terms. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
Human verifies live deployment, asset loads, report and handoff, signs release record. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Validate /silverspark-compass/ static artifact and GitHub Pages runtime. Confirm policy suitability for public commercial client-acquisition use or refuse commercial release until resolved.
