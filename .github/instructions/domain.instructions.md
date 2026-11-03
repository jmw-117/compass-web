---
applyTo: "src/domain/**/*.ts,docs/domain/**/*.json,tests/unit/**/*.ts"
---
# Domain and scoring instructions
Never change approved numerical rules without a semantic version change, golden-case diff and human S1 reapproval. Use pure `evaluate()` with integer interval scoring. Probes remain unscored, budget never changes readiness, and unknown answers are not imputed. Tests must be independent of the implementation and cover high-risk gates, property invariants and edit/revert idempotence.
