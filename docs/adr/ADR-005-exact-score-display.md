# ADR-005 — Display exact readiness scores as one whole number

**Status:** Approved by the Product Owner in chat on 2026-11-03 for this presentation change; independent S1 review and broader contract approval remain pending.

## Context

The evaluator stores exact scores in integer eighth-points. Flooring the lower endpoint and ceiling the upper endpoint can display a range such as `[27, 28]` even when both raw endpoints are the same and there are no unknown answers.

## Decision

- When the raw lower and upper score endpoints are equal and the assessment is complete, display one nearest whole-number score out of 100.
- Do not display decimal scores.
- When raw endpoints differ, retain the rounded `[lower, upper]` interval. Unknown answers continue to widen the interval and must never be suppressed.
- Determine maturity bands from the raw score endpoints, not the rounded display value.

The Product Owner explicitly requested the nearest whole number with no decimals on 2026-11-03. This changes presentation only; score calculations, weights, gates, and unknown-answer behavior remain unchanged.

## Consequences

- Report contract and version manifest record the exact-score display rule.
- Results, report, and user-controlled share summary use the same score-or-interval wording.
- Existing score fixtures remain unchanged; tests cover exact fractional rounding and true uncertainty intervals.
