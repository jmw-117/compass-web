# Silverspark Compass

Use the product specification and the versioned machine-readable contracts in `docs/domain/`. For the same assessment scope, exact rules, option IDs, weights, predicates and catalog content come from the domain JSON and recorded owner decisions. The earlier v1.3.0 prose mentions a sixth budget gate. ADR-004 records its removal. Budget affects recommendation feasibility only.

- Keep every visible button label to one or two words, including links styled as buttons. Put extra explanation in adjacent help text. Keep backward navigation aligned to the leading edge of each action row.
- Deploy a static React/Vite/TypeScript build to GitHub Pages. There is no backend, paid inference, account, telemetry or automatic submission.
- Use the 14 scored anchors as the sole numeric readiness instrument. Unknown answers widen the interval. Conditional evidence questions and the technical annex are diagnostic. Keep inactive answers out of decisions and reports.
- Keep assessment data browser-local. Show the exact minimised summary before opening WhatsApp. Preserve voluntary sharing and self-reported results.
- Keep domain rules separate from UI, validate references, and preserve expected golden results. Get product-owner approval for changes to the scoring method, gates or expected results. Report test and real-user evidence accurately.
- For each requested change, Codex owns delivery through live verification. Open or reuse one pull request from `codex` to `main`. Once GitHub’s required checks pass on the current commit, merge the pull request and follow the Pages deployment through its live checks. The owner grants standing authorization for these routine releases. Use the 100-point completion scale in docs/BUILD_STATUS.md.
- Use SHA-pinned Actions, quality-gated deployment from protected main, static subpath checks and a rollback path. Verify the intended Pages deployment and get the required release approval before public commercial use.
