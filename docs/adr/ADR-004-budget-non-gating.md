# ADR-004 — Budget does not affect readiness gates or confidence

**Status:** Architect decision recorded; S1 approved for development progression, while independent golden-case review and real-world validation remain pending

## Context

Product requirement FR-007 says one-off and recurring budget inputs do not change readiness scores, gates, or confidence. The prior draft rules represented an unknown budget as a formal `BUDGET-UNKNOWN` gate, creating a direct conflict.

## Decision

Budget must not change readiness scores, dimensions, coverage, readiness bands, formal gates, or assessment confidence. Budget may constrain action feasibility and cost-fit labels. If budget is unknown, cost fit is unverified; it is not a gate and must not be presented as an affordability conclusion.

This records the Architect's explicit S1 decision to follow FR-007 literally. It does not approve or freeze the S1 contract catalog.

## Consequences

- Remove `BUDGET-UNKNOWN` and its predicate from the formal gate set.
- Keep budget use limited to recommendation feasibility and cost-fit behavior.
- Add fixture-level budget non-effect expectations; these are contract invariants, not empirical expected outcomes.
- Increment affected contract versions and keep the manifest `DRAFT_UNAPPROVED` pending S1 review.
- Preserve remaining ambiguity about the relationship between one-off and monthly budget fields for human review.

## Verification

`npm run check:contracts` verifies no budget reference is present in any formal gate predicate, the manifest and gate contract versions agree, and the proposed golden fixture declares budget non-effect invariants for score, gates, and confidence. The evaluator is not implemented, so runtime behavior has not been tested.
