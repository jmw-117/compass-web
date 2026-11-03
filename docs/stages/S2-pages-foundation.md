# S2 — Repository, GitHub Pages and CI foundation

**Stage outcome:** Scaffold a deployable static shell with reproducible checks.

## Inputs and prior approvals
S1 approved and GitHub repo/configuration authorized. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
Vite/React TS strict scaffold, package lockfile, test runners, designed landing page, Pages base and Actions gated workflow. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Compilable app skeleton, commands and CI workflow, /silverspark-compass/ browser/asset check. Create `docs/handoffs/S2-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
Do not add backend, Worker, paid provider, automatic telemetry or speculative UI library. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
S2 scripts run, branch CI works, static artifacts sound, accessibility shell reviewed. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Build semantic HTML landing with non-JavaScript fallback, Vite static base, and code-split report module. Validate machine schema contracts for the new v1.3 files, including all references and branch labels.
