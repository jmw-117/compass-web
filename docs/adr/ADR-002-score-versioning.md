# ADR-002 — Score uncertainty and versioning

**Decision:** 14 universally applicable score-bearing indicators, unknown represented as [0,4], exact integer eighth-point bounds, coverage in integer units out of 200. No N/A, no imputation, no incomplete-score suppression. Evidence probes never affect score. Published option IDs immutable. Draft supports latest plus previous schema for limited time; older drafts ask to restart. Historical reports remain attached to historical rule versions, not silently recalculated.

**Reasons:** prevents sparse-answer false precision, low-maturity exclusion, floating-point edge cases and scoring drift. Revisit after calibration evidence.
