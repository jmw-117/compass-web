# S0 — Concierge validation

**Stage outcome:** Pilot rubric, consent-safe worksheet and human-reviewed discovery value.

## Inputs and prior approvals
Initial proposed JSON and sponsor-approved research/consent protocol. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
10–15 actual business interviews; timings, clarity/unknown rates, anonymised patterns and at least five independent reviews. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Study protocol, consent model, anonymized measurement log, reviewer rubric, decision changes. Create `docs/handoffs/S0-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
Do not invent real respondents or label AI-generated fixtures as interviews; no app engineering yet. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
Completion/usefulness distribution reviewed; human signs evidence and records limitations. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Pilot must test the actual 14 questions, optional business context, and technical module comprehension with at least one experienced AI-workload stakeholder. Write consultant-approved expected recommendations and score intervals. Test lower-maturity owner-operators. Record whether the new discovery fields create useful consulting context or cause friction.
