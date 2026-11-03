# ADR-007 — Add a cautious traffic-light readiness signal

**Status:** Product Owner-selected mapping; independent S1 review and S5 human review remain pending.

## Context

The numeric result is difficult to interpret at a glance. The Product Owner requested a traffic-light-inspired design and selected a mapping based on the existing provisional maturity bands. The signal must not imply that Compass approves a specific AI use case or deployment.

## Decision

- Red maps to the Foundational band (0 to under 25): **Not Ready Yet**.
- Amber maps to the Emerging and Developing bands (25 to under 75): **Building Readiness**.
- Green maps to the Established band (75 to 100): **Strong Foundations**.
- For a range spanning different colors, use the lower endpoint's more cautious color and explain that the range reaches a higher signal.
- Keep displaying the numeric score or explained range; the signal supplements rather than replaces it.
- Include text labels and guidance so color is never the only carrier of meaning.
- State that the signal is not approval to deploy AI and that use-case safeguards must still be confirmed.

## Consequences

- The existing score, maturity thresholds, gates, and unknown-answer behavior are unchanged.
- Results and the report/PDF use the same signal and caveat.
- The S5 implementation and domain contract remain subject to independent and human review.
