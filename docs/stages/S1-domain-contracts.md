# S1 — Freeze decision contracts

**Stage outcome:** Resolve ambiguity before any scorer implementation.

## Inputs and prior approvals
S0 human-approved handoff; proposed question/probe/rule/action JSON. Confirm `docs/handoffs/ledger.json` shows previous stage as `approved` by named human; if not, only draft proposals and stop.

## Bounded execution scope
Reviewed question bank, predicates, action budget taxonomy, 13+ independent golden expectations, validated references. Implement tests/evidence appropriate to scope and do not modify unrelated stages.

## Deliverables
Signed contract catalog, data/semantic version record, fixture diff, contract audit. Create `docs/handoffs/S1-handoff.md` using the standard handoff template.

## Non-goals and disallowed shortcuts
Never invent scoring gates/actions or use the implementing agent as golden expected-output author. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Acceptance (human-reviewed)
Human and independent reviewer accept catalog and exact golden outcomes; all relevant JSON crossrefs valid. Attach actual command outputs, test locations, reviewer notes and open risks. **The implementing agent cannot approve its own stage.**

## Handoff to following stage
State precise artifact paths, git SHA if available, input JSON versions, scope omissions, failing tests, risks and the acceptance gates the next agent must recheck. Review status must remain `review_requested` until a human changes and signs it.


## v1.3 technical-product handoff addition

Must review and sign docs/domain/technical_extension.json, prospective_client_discovery.json, report_contract.json, product_requirements.json, user_journeys.json and VERSION_MANIFEST.json. Confirm AWS-style technical flags are evidence-only; no undocumented gate overrides. Cross-check the seven Microsoft pillars and nine AWS areas. Freeze source IDs and exact report fields.
