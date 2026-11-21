# Silverspark Compass

Use the product specification and the versioned machine-readable contracts in `docs/domain/`. For the same assessment scope, exact rules, option IDs, weights, predicates and catalog content come from the domain JSON and recorded owner decisions. The earlier v1.3.0 prose mentions a sixth budget gate. ADR-004 records its removal. Budget affects recommendation feasibility only.

- Deploy a static React/Vite/TypeScript build to GitHub Pages. There is no backend, paid inference, account, telemetry or automatic submission.
- Use the 14 scored anchors as the sole numeric readiness instrument. Unknown answers widen the interval. Conditional evidence questions and the technical annex are diagnostic. Keep inactive answers out of decisions and reports.
- Keep assessment data browser-local. Show the exact minimised summary before opening WhatsApp. Preserve voluntary sharing and self-reported results.
- Keep domain rules separate from UI, validate references, and preserve expected golden results. Get product-owner approval for changes to the scoring method, gates or expected results. Report test and real-user evidence accurately.
- Deliver and verify the product continuously. Use existing stage records for historical evidence. Future changes do not require stage handoff documents.
- Use SHA-pinned Actions, quality-gated deployment from protected main, static subpath checks and a rollback path. Verify the intended Pages deployment and get the required release approval before public commercial use.
