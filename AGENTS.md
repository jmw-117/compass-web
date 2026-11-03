# Silverspark Compass — Agent authority (v1.3)

**Read first**: `docs/PRODUCT_TECHNICAL_SPECIFICATION.md`, `docs/domain/VERSION_MANIFEST.json`, `docs/stages/INDEX.md`, the selected stage instructions, and the domain contracts relevant to the stage.

**Primary product source:** `docs/PRODUCT_TECHNICAL_SPECIFICATION.md` defines the user experience, discovery, assessment, reporting, technical extension, and consultant operations. Machine JSON contracts define exact values, triggers, identifiers, weights and mappings. Raise discrepancies in S1; do not pick one silently.

**Hard rules**:
- GitHub Pages static-only deploy; no paid inference, server secret, server submission or hidden analytics.
- Existing 14 core indicators determine the sole numeric readiness interval. The optional 18-question AWS-style extension is **diagnostic only**. Do not change weights, core ID strings, source predicates, gates or costs without human signoff.
- Unknown answers widen intervals, not zero. Budget never changes the readiness score.
- Never claim audited/verified client data, legal compliance, fixed pricing, ROI, or automatic WhatsApp delivery.
- Only one stage S0..S8 at a time. Implementer != reviewer. Preserve golden expected results that human owners wrote; do not invent ground truth.
- Read stage entry/exit criteria; produce handoff with evidence, exact commands and outcomes and unresolved dependencies.
- Public commercial GitHub Pages launch is blocked until its usage policy is reviewed and approved for the intended deployment.

**Stage S1 must sign off** the new `technical_extension.json`, `prospective_client_discovery.json`, `report_contract.json`, `product_requirements.json` and `user_journeys.json` before implementation. If they differ from existing v1.2 rules, record an ADR and signed contract update.

# Silverspark Compass — Agent Operating Contract v1.2

## Immutable facts
- Deploy V1.2 to **GitHub Pages**, never Cloudflare/Workers/Pages, D1, Firebase, Vercel, or a backend. No paid model API, account system, telemetry or automatic lead capture.
- The repository produces a static Vite/React/strict TypeScript `dist/` served at `/silverspark-compass/`. GitHub Pages is the target host, and the platform's **commercial restrictions are an unresolved human launch gate**.
- Source of truth for business logic: `docs/domain/*.json` (proposed v1.1 contracts until S1 approved); architecture: `docs/ENGINEERING_BLUEPRINT.md`; stage contracts: `docs/stages/` and `docs/handoffs/`.
- Never fabricate business rules, scoring thresholds, client evidence, affordability, price quotations, compliance conclusions, approvals, test passes, deployments or live URLs.
- No user data/PII/secrets in repo, URLs, CI logs or third-party analytics. WhatsApp handoff is user-reviewed and **does not mean delivered**.

## Stage discipline
1. Read `docs/stages/INDEX.md`, `docs/handoffs/ledger.json`, your **one assigned** `docs/stages/SN-*.md`, and the preceding accepted handoff. Do not build later stages or parallel-edit approved domain rules.
2. Confirm prerequisites and input versions; if any handoff is pending or contradicted, STOP, report missing authority and limit work to a safe document proposal.
3. Build one bounded vertical slice with independent tests; avoid broad scaffolding, speculative libraries, undocumented dependencies and unrelated refactors.
4. After code changes execute applicable tests, record exact commands/results and limitations in `docs/handoffs/SN-handoff.md` using the template. No tests run = `not_run`, never passed.
5. Submit for separate agent and **human** review; do not mark own handoff `approved`. Only a human-signed handoff in ledger permits the next stage.
6. Any change to question IDs, option meaning, weight, gates, path ranking or recommendations requires version increment, golden-case diff and S1 human reapproval.

## Quality and constraints
- Pure and deterministic evaluator with interval scoring; budget never changes maturity. Probes do not contribute to numeric anchors. Actions trace to evidence and have valid prerequisites.
- Preserve accessible native semantics, keyboard focus, 320px device, plain-language copy and Silverspark navy `#0e1828`/charcoal/off-white/silver. Only licensed web fonts or fallbacks.
- Keep JS lean, use `sessionStorage` with disclosed autosave and optional IndexedDB, no JSON import and no browser-only assumptions that break in-app browsers.
- The app's results are self-reported and unverified. Never imply the PDF is certified or signed.
- GitHub Actions deployment must be quality-gated, SHA-pinned, subpath-tested, branch-protected and use `actions/deploy-pages`. No CI private secrets required for Pages.
- GitHub Pages does not honor Cloudflare-style `_headers` files. Meta CSP has limitations; report actual security capabilities honestly.

## Every handoff must report
Input handoff/hash; scope; changed files; commands and results; acceptance checklist; risks; unresolved decisions; outputs/artifact versions; rollback instructions; next-stage blockers. Distinguish **proposed**, **implemented**, **tested**, **deployed**, **validated**.
