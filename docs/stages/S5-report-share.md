# S5 — Report and voluntary handoff

**Stage outcome:** Accessible report, printable pages, explicit sharing without backend.

## Inputs and prior approvals
S4 accepted; verified WhatsApp destination and approved copy. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
Seven dimensions, score interval (or one nearest whole-number score when exact), evidence, prioritized actions, print CSS, share preview + copy + WhatsApp fallback. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Accessible results/print flows, exact outbound payload examples, report-version evidence. Create `docs/handoffs/S5-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
No automatic delivery/lead claim; never send full answers or client PII in URL. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
Report accuracy on synthetic golden cases; manual mobile share/print checks passed. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Implement all report_contract.json mandatory sections and consultant review template. Show one whole-number score only when exact; otherwise explain the range in plain language without bracket notation. Use the same clear wording in results, report/PDF and share text; explain unknown-answer uncertainty. Show each dimension, known-answer count, safety checks, evidence gaps, actions, budget constraints, and optional technical annex. Include the approved traffic-light mapping in results and report; use the conservative lower-bound color for uncertain ranges and state that the signal is not deployment approval. Do not expose unexplained weighted coverage units to clients. Use HTML first, print second, consented user-previewed handoff.
