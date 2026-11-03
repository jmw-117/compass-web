# Codex — Silverspark Compass (v1.3.1 runnable starter)

1. Read `AGENTS.md`, `README.md`, `docs/PRODUCT_TECHNICAL_SPECIFICATION.md`, `docs/stages/INDEX.md` and `docs/handoffs/ledger.json`.
2. Verify the restored development environment by running `npm ci`, `npm run verify`, `npm run dev` (smoke), plus the two Python contract audits. Record actual results. The S0 pilot runs with a dependency-free browser interface. Do NOT confuse it with the target React/Vite implementation.
3. Work on **S0 only**, unless the prior handoff is genuinely approved by a human. Use `.github/prompts/S0.prompt.md`.
4. Provide a 10–15-business pilot protocol, comprehension and usefulness measurement form and consultant-labelled reference cases; do not fabricate respondents or signoffs.
5. After S0 human approval, S1 freezes rule contracts. Only then S2 migrates the bootstrap to React + Vite + TypeScript with full tests and a regenerated lockfile. Preserve `docs/domain/*.json` as canonical contracts and `/silverspark-compass/` deployment behaviour.
6. Finish with `docs/handoffs/S0-handoff.md` marked review_requested (not approved), including commands actually run, findings, obstacles and decisions needed from the product owner.
