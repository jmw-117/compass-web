# ADR-006 — Explain uncertain readiness ranges

**Status:** Product Owner-selected presentation; independent S1 review remains pending.

## Context

When answers are unknown, the evaluator correctly returns a readiness interval. Bracketed endpoints and weighted coverage units are difficult for clients to interpret, but collapsing an interval to one value would hide uncertainty and imply unsupported precision.

## Decision

- Keep the evaluator's existing interval and unknown-answer behavior unchanged.
- Present an exact score as one nearest whole number, as recorded in ADR-005.
- Present differing endpoints as “lower to upper out of 100,” without brackets or decimals.
- Explain that the result is a range, not a single score, and that confirming “I am not sure” answers may narrow it.
- Present result-page coverage as known answers out of the 14 core questions, rather than opaque weighted units.
- Describe triggered formal gates as safety checks to review; retain the exact gate identifiers in the detailed report.
- Use the same score wording and uncertainty explanation in results, the report/PDF, and the voluntary share text.

## Consequences

- No score values, weights, gates, maturity bands, or unknown-answer rules change.
- Human review is still required before the S5 handoff is approved; this ADR does not approve public launch.
- Tests cover range wording, explanation, exact-score wording, and client-facing summary labels.
