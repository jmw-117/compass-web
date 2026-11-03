> **v1.3 companion:** This v1.2 delivery blueprint is retained as the baseline. The authoritative *expanded product feature and technical specification* is `docs/PRODUCT_TECHNICAL_SPECIFICATION.md`. The v1.3 JSON addenda define optional deep diagnostic and complete report/UX requirements. The original 14-question scoring engine remains unchanged pending S1 review.

# SILVERSPARK COMPASS
## AI Readiness & Budget-Aware Discovery — Product Engineering Blueprint v1.2

**Status:** ENGINEERING PLAN / VALIDATION PENDING — application not built, deployed or independently validated  
**Date:** 2 November 2026  
**Owner:** Silverspark Consulting — *Strategy in Action*  
**Implementation:** Codex + GitHub Copilot, staged development with human approval gates  
**Target audience:** Kenyan sole proprietors and SMEs, extensible to larger organisations  
**Deployment target:** **GitHub Pages exclusively in V1.2** — `https://<owner>.github.io/silverspark-compass/` (project-site default)  
**Technical architecture:** pure browser application; React + Vite + strict TypeScript; **no server, Worker, D1, authentication backend, paid AI API, or hidden submission endpoint**  
**Domain authority:** `docs/domain/*.json` retains v1.1 *proposed* question and rule versions, pending signed S0–S1 validation.  
**Build authority:** `docs/stages/INDEX.md`, individual stage files, `docs/handoffs/` and `AGENTS.md`.

> **GitHub Pages policy caveat (material launch gate):** GitHub Pages is intended to showcase projects, not to run an online business, commercial transaction service or commercial SaaS. The requested GitHub Pages deployment is technically straightforward for an educational/advisory static instrument, but whether a specific commercial lead-generation use is permitted must be resolved under current GitHub terms before public commercial rollout. This blueprint does **not** represent commercial-use authorization. No paid transactions, hosted lead database or SaaS are implemented. If GitHub's policies preclude the intended production use, halt that use and record a change request; do not silently switch hosting or ignore the terms.

> **Evidence boundary:** Methodology and cost classes are draft consultant hypotheses, not market-calibrated measurement instruments. No certification, guaranteed cost saving, regulatory opinion or fixed affordability claim may be generated.

---
# 0. Executive decision and revision log

**Decision:** Make **GitHub Pages the actual, exclusive V1.2 deployment platform**, not a demonstration fallback. Keep an entirely static app. Replace monolithic milestone work with approved, agent-executable stages and explicit contract-based handoffs. **No full implementation begins until the questionnaire and decision contract pass independent review.**

| Design concern | v1.1 | v1.2 binding decision |
|---|---|---|
| Production host | Cloudflare Workers Static Assets | GitHub Pages, GitHub Actions artifact publication |
| API / persistent intake | Optional Worker + D1 | **Not included**; user-triggered WhatsApp handoff only |
| Commercial usage | Worker commercial platform | GH Pages policy suitability review is a release blocker for commercial use |
| Deployment shape | Client + Worker | Pure static `dist/`, no server or runtime secrets |
| Frontend paths | Portable SPA | GitHub project-site subpath and hash-state navigation; no server rewrites |
| Build & testing | Large milestones | Nine bounded stages S0–S8, one agent task/PR at a time |
| Agent governance | Root instructions and starter prompt | Concise `AGENTS.md`, scoped Copilot instructions, stage-specific prompts, change-boundary checks |
| Stage handoff | General work summary | Standard template: artifacts, test evidence, decisions, risks, version/hash, next-stage prerequisites |
| Launch | Worker deploy on gated CI | PR quality checks → merge on protected `main` → gated Pages Actions deploy; smoke and rollback |
| Reports | Local HTML, print, optional share | Unchanged, but no claim of confirmed delivery, automatic lead capture or PDF file when only printing |

## 0.1 Product definition and explicit boundaries

> Discover how ready your organisation is for AI, understand the gaps, and receive a practical next step appropriate to your constraints and available budget.

**Included:** three-field start; fourteen universal maturity indicators; up to seven distinct optional evidence probes; conservative score intervals; seven dimensions; gate/path recommendation engine; budget/capacity fit; early five-question preview; premium mobile HTML results; print/save-as-PDF; explicit copy/share summary; user-controlled WhatsApp contact; local resume; fully static deployment; GDPR/ODPC-aware content practices and privacy review.

**Excluded:** AI model inference and chatbot APIs, paid providers, client accounts, identity management, sensitive document uploads, online payments, automatic lead collection, server intake, telemetry, server analytics, backend persistence, CRM synchronization, partner/tenant management, admin dashboard and architecture generation.

**Performance:** no server cold-start or backend operating charge. Low-end Android usability and page performance remain acceptance requirements. Browser-side code and domain rule contents are publicly inspectable; do not claim intellectual-property secrecy from bundling or minification.

## 0.2 Critical decisions and review authorities

- **Human product owner** owns business rubric, commercial positioning, language and final publish approval.
- **Independent reviewer** must approve at least five concierge cases, critical gate safety and golden expected outcomes.
- **Implementation agent** may implement approved contracts but must not silently amend score weights, gate predicates, budget mapping, action narratives or privacy language.
- **Reviewer agent** checks patch boundaries, test evidence, missing assumptions and diff against approved contract; cannot approve its own authored business rules.
- **Operator** confirms the actual WhatsApp destination, privacy/ODPC position, repository privileges and GitHub Pages usage appropriateness before public distribution.

## 0.3 Launch ethics and measurement

The user gets results without surrendering contact information. No automatic questionnaire submission, analytics beacon or covert tracking. Pilot funnel data must come from separately consented moderated sessions or manual records. WhatsApp button clicks are **share intent** only; neither confirmed messages nor qualified leads can be inferred. A static-only assessment does not automatically furnish Silverspark with prospective clients' answers. Track manual lead response and consultant-review time; this is not a zero-total-cost business.

# 1. Commercial hypothesis and pre-build validation

**Business model hypothesis:** The free assessment improves qualified discovery for Silverspark's AI Transformation, AI Enablement, Digital Systems and Technology Advisory services. It should **not** recommend a paid engagement unless the company would benefit from consultant review; no artificial sales urgency.

**M0: concierge study, 2–3 weeks maximum (proposed):**

1. Recruit 10–15 real consenting businesses: target 5 sole proprietors, 7 SMEs and up to 3 more mature/regulated organisations where available. Do not over-recruit regulated sectors simply to hit quotas.
2. Run the 14 question bank through a simple form or moderated interview, without collecting client secrets; record time, abandoned stages, unknown rates, misunderstood questions and observed examples. A tool such as Google Forms can be used subject to a privacy/vendor assessment; a local/self-hosted form avoids additional vendor access.
3. Hand-score independently of any generated engine; create a short decision rationale and recommended top three actions per company. Use an independent reviewer for at least five cases so the founder is not the only labeler.
4. Record the respondent's independent assessment of whether the actions are useful and understandable. Use clearly separated consent for later marketing contact.
5. Pre-register thresholds below, inspect false positives, calibrate question wording and gates, then **sign off the decision tables before Codex builds any scoring code**.

### Proposed pilot success / stop thresholds (hypotheses, not observed benchmarks)

| Metric | Proposed initial threshold | How measured |
|---|---:|---|
| Guided assessment completion | >= 70% in moderated study | Completed / started, excluding facilitator technical failure |
| Median time for 14 cores | <= 12 minutes | Manual start/end timestamps |
| Consultant-rated discovery usefulness | >= 70% score 4/5 or 5/5 | Independent reviewer and predefined usefulness rubric |
| Client-rated recommended actions actionable | >= 70% agree | Simple post-report question |
| Highest-ranked path concentration | <= 60% in mixed SME pilot unless case mix explains | Count primary paths; review distribution, not game scores |
| Question comprehension | <= 15% of respondents need explanation per question | Moderator issue logs |
| Critical false-safe recommendations | 0 | Independent human red-team cases |
| Unprompted contact/consultation requests | Track baseline; no fabricated conversion target | Consented manual pilot log |

**Kill / redesign decision:** If the instrument cannot produce differentiated, useful actions on representative cases after two rubric iterations, stop at concierge mode or reposition as a purely educational tool. Do not justify investment by the number of questionnaires completed alone.

### Human-labeled test evidence

Store consent-safe synthetic reproductions of pilot patterns in `docs/domain/golden_cases.json`. Handwrite expected primary path, triggers, uncertainties and actions **before** any assistant generates the evaluator. Never commit customer names, contact details, raw confidential responses, or screenshots with PII.

---

# 2. UX and interaction contract

## 2.1 Experience hierarchy

```
Pre-rendered landing (purpose / how long / privacy) 
  -> Start: 3 fields (organization type, sector, main goal)
  -> Core questions 1–5 (quick value, low jargon)
  -> Interim preview (no full score or misleading maturity classification)
  -> Continue 9 remaining core indicators + only useful evidence probes
  -> Results: evidence interval / gaps / gates / top candidate path
  -> Personalize: budget ceiling/band, staff capacity, timeline, data sensitivity, high-impact AI context
  -> Final recommendations and report
  -> Optional user-controlled share: WhatsApp summary / secure submit / print / save
```

**Reordering constraint:** Governance/data-sensitive questions from later intake may cause path recalculation. The provisional preview must not contain conclusions sensitive to those unanswered facts. Final submission must occur only after high-impact/data-use context is captured.

**Early preview:** show only answered dimension fragments and a plain-language 'so far we see...' statement; never extrapolate an overall score from five indicators. The user can skip to the report at any time but receives a widened uncertainty range and a verification-first path.

## 2.2 Copy and accessibility

- One core question per screen at 320px; show 5 short recognizable choices plus 'I am not sure' and a visible Skip option where appropriate.
- Universal copy uses **'you and anyone who helps you'** rather than assuming a staff team, CIO, AI committee, IT department or audit function. A sole proprietor can be the responsible owner.
- Do not ask for names, turnover, contact details or budget before proving value; company name optional at report generation.
- Progress reflects sections and observed remaining items, without jerky percentage changes when probes activate/deactivate.
- Preserve focus, labels, live announcements, visible Back, edit, Skip, resume and accessible validation messages. No timers or surprise popups.
- Fonts: Helvetica headings / Helvetica Neue body when available and licensed, with system fallbacks; palette navy `#0e1828`, charcoal, off-white and silver, no stock art.
- Target WCAG 2.2 AA. Aim for >=44px touch targets as a product preference; WCAG 2.2 AA's relevant minimum is 24x24 CSS pixels, with exceptions. Include keyboard, zoom, screen-reader and real mobile checks.
- Text language `en-KE` with a separately reviewed `sw-KE` translation track after pilot evidence; never ask Codex to fabricate translations or technical equivalences.

## 2.3 Device and export support

| Environment | Questionnaire | HTML report | WhatsApp handoff | PDF via print |
|---|---|---|---|---|
| Chrome/Edge desktop current + previous | Required | Required | Link fallback | Supported |
| Firefox desktop current | Required | Required | Link fallback | Best effort; manual tested |
| Safari iOS current + previous | Required | Required | Required via OS/browser | Best effort; manual tested |
| Chrome Android on low-memory phone | Required | Required | Required | Best effort |
| WhatsApp/Facebook embedded browser | Attempt; show 'Open in browser' if limited | Required | Fallback browser link | Not relied on |

Never advertise a PDF **download** if all the app does is invoke `window.print()`. Label the action **Print / Save as PDF**. HTML report and short shareable plain-text summary must remain useful when printing and Blob downloads fail.

**Performance budgets (initial proposed thresholds):** pre-render/supply a static HTML landing shell; entry JS gzip <= 90 KiB (subject to real audits); report/PDF code lazy loaded, total JS transferred before first question <= 160 KiB gzip. Test on an actual low-end Android phone and constrained network. Lab LCP <=2.5s is a target, not a claimed field metric without field telemetry.

## 2.4 Local draft behavior

1. `sessionStorage` autosave after each answer if available, disclosed on start; tab-scoped and generally cleared when tab is closed, but browser session restoration can preserve it—do not promise guaranteed deletion on close.
2. Explicit **Save on this device** switches to IndexedDB with visible storage/disclosure and **Delete my assessment** action.
3. If browser storage is blocked/full, preserve in-memory answers and disclose that leaving may lose progress; no questionnaire breakage.
4. Multiple tabs: each tab has a session draft; durable IndexedDB uses revision/updatedAt and refuses silent overwrites by stale tabs. Show conflict UX.
5. Draft expiry: 30 days since last update; on opening old drafts prompt to start again (never silently delete without warning). Offer export of prior answers if the user wants it; a historical assessment uses its historical methodology, not latest silently.
6. Versions: support current and immediately previous question bank (N and N−1) for up to 30 days after release; otherwise display a clear restart and no blind migration. Preserve archived rule bundles for generated report verification but need not ship every bundle to every client.
7. Stable question and option IDs; immutable published values. Any meaning change requires new ID or formally tested migration and schemaVersion bump.

---

# 3. Assessment domain and content

## 3.1 Normative data files

| File | Contract |
|---|---|
| `docs/domain/profile_schema.json` | Three-question start; later budget, jurisdiction, sensitive/high-impact AI use, staff capacity, source and partner |
| `docs/domain/question_bank.json` | Seven weighted dimensions, 14 universal indicators, five anchored choices + explicit unknown; no inferred N/A |
| `docs/domain/probes.json` | Seven optional evidence questions and exact trigger predicates; never scored |
| `docs/domain/rules.json` | Integer scoring, gate metadata, path precedence, ranking and budget-class controls |
| `docs/domain/decision_predicates.json` | **Normative machine-readable predicates** for six gates and seven paths |
| `docs/domain/action_catalog.json` | 24 initial actions with IDs, linked evidence, roles, prerequisites, validation, effort/cash classes |
| `docs/domain/golden_cases.json` | Twelve proposed synthetic hand-authored expectations and metamorphic cases, NOT executed outcomes |

No duplicated rubric prose in code. This document explains contracts; JSON is authoritative. All machine files must be validated at load/build time using Zod schemas and referential-integrity tests.

## 3.2 Seven dimensions

| ID | Dimension | Weight | Indicator IDs |
|---|---|---:|---|
| STR | Business & Strategy | 15% | STR-01, STR-02 |
| PRO | Processes & Workflows | 15% | PRO-01, PRO-02 |
| DAT | Data Readiness | 15% | DAT-01, DAT-02 |
| TEC | Technology & Systems | 15% | TEC-01, TEC-02 |
| PEO | People & Adoption | 15% | PEO-01, PEO-02 |
| GOV | Governance & Security | 15% | GOV-01, GOV-02 |
| MET | Measurement & Execution | 10% | MET-01, MET-02 |

All fourteen indicators apply to every person: a one-person business can have a decision owner, records, checks, workflow, and a way to measure results without having formal departments. **No universal score-bearing question may be answered N/A in V1**; this explicit rule removes ambiguous applicability mathematics. Optional evidence probes are skipped whenever not relevant.

## 3.3 Answers, probes and edit consequences

- `L0`–`L4` mean anchored self-reported maturity, each scored 0–4; `UNK` means the respondent cannot assess the situation. Never convert unknown to zero.
- Probes collect **different evidence** (specific recent manual duplication, observed record error, unsafe AI sharing, owner identity as a role, available baseline). They modify **gate or validation status**, not anchor numeric scores.
- If an anchor asserts mature integration yet an evidence probe describes every critical transfer as manual, show a 'These answers appear inconsistent' review prompt and record a discrepancy; do not silently overwrite maturity.
- Derive probe visibility and gates from **one pure `evaluate(currentAnswers, profile, version)`** call. On edit, inactive probe responses are inert; they never leak into submission or scoring. Edit-then-revert reproduces identical output.
- Every generated report observation should cite the underlying `question_id` or `probe_id`. The report cannot promote an unobserved inference to fact.

## 3.4 Evidence and interpretation

Record four distinct concepts: `self_reported`, `answer_clarified`, `client_examples_unverified`, and `externally_verified` (reserved for human-reviewed future engagements). V1 does not label a response 'verified' merely because a probe was completed. A numeric score is a self-report result; **coverage** is not statistical confidence. Show a factual `known_answers/14` count and `weighted_coverage` separately.

---

# 4. Corrected scoring: integer, uncertainty-aware, reproducible

Let `w[d]` be the seven integer weights, totaling 100. Exactly two universal anchors belong to each dimension. For each known answer, score `s` is an integer 0–4. Unknown answers have a possible score interval `[0,4]`.

**Use integer eighth-point units:**

```
L8 = Σ (w[d] × s[q]) for known answers; unknown contributes zero
U8 = Σ (w[d] × s[q]) for known answers; unknown contributes 4 × w[d]
coverageUnits = Σ w[d] for every known answer   // integer 0..200
lower = L8 / 8
upper = U8 / 8
coveragePercent = coverageUnits / 2
```

Because 2 anchors × 4 maximum score × weights 100 / 8 = 100, these exact formulas produce a range within 0–100 without imputing unknowns. No floating threshold comparison is required. The interval is the possible score **under the instrument's assumptions**, not a statistical confidence interval.

**Display:** `floor(L8/8)` to `ceil(U8/8)`; if all known, show one score with its exact method rounding. Do not relabel it 'accurate' merely because all 14 self-reported answers are present.

**Bands (unvalidated, descriptive):** 0≤x<25 Foundational; 25≤x<50 Emerging; 50≤x<75 Developing; 75≤x≤100 Established. Compute membership using raw `L8/U8` against 200/400/600/800; show one band **only if both endpoints are in the same band**. Otherwise show 'Readiness spans multiple bands—verify unanswered areas.' No artificial 80% suppression. Keep band names and thresholds provisional until M0 calibration.

**Example:** Two unknown DAT indicators yield coverage 85% (integer coverageUnits=170) and a legitimate interval reflecting the unassessed 15% data dimension, rather than a made-up score or 'no result'. All unknown yields `[0,100]` and verification-first advice.

### Properties to test automatically

- Perfect 0s = 0; perfect 4s =100; never outside [0,100].
- Raising any known score without changing other inputs cannot decrease either endpoint.
- Turning an unknown into 0 leaves the lower bound unchanged and reduces the upper bound; turning unknown into 4 increases lower but leaves upper unchanged.
- Changing budget never changes any readiness, dimensions or coverage.
- Reordering answer object keys cannot change output. Edit → revert yields identical canonical output.
- A closed/inactive probe cannot affect gates, paths or scores.
- No report uses a single definitive band when range crosses boundaries.
- Unknown != zero; no fabricated implied probability/confidence value.

---

# 5. Gates and recommendation decision table

## 5.1 Exact condition and consequence

| Gate | Trigger (normative AST in `decision_predicates.json`) | Result |
|---|---|---|
| URGENT-REGULATED | High-impact AI workflow **yes** AND piloted/operational or planned AI use | Specialist review P6 before pilot; do not decide legal status from industry alone |
| GOV-DATA | Unsafe personal/restricted data sharing confirmed; OR restricted-data AI use planned with GOV-01≤1 | Protect information P2; block uncontrolled AI experimentation |
| DATA-UNKNOWN | Both core data indicators unknown, or vital records absent (DAT-01=0) | Verify first P0; ask what data actually exists |
| OWN-NONE | STR-02=0 or no named role can authorize urgent change | Block pilot selection; ownership action mandatory |
| BASELINE-MISSING | Goal is measurable, MET-01≤1, and no baseline confirmed | Do not claim financial benefit; baseline action mandatory |
| BUDGET-UNKNOWN | No amount or clear band supplied | Do not claim affordability; show no-cash options with staff-time caveat |

**Important:** ordinary customer names or phone numbers count as personal data for privacy handling, but **their mere existence does not automatically force governance as the primary recommendation**. Unsafe use or planned restricted-data processing is a stronger explicit trigger. A 'No' answer to unsafe sharing is self-reported, not a declaration of compliance.

**Safety precedence:** P6 before P2 before P0 before P1/P4/P3/P5. Show every applicable gate, even if another path wins. `OWN-NONE` and `BASELINE-MISSING` block a pilot but do not automatically override a more relevant foundational path.

## 5.2 Primary paths P0–P6

| Path | Trigger | Typical initial action IDs |
|---|---|---|
| P6 — Specialist review | URGENT-REGULATED | A20, A21 |
| P2 — Protect information | GOV-DATA | A09, A07, A08 |
| P0 — Verify unknowns | ≥3 unknowns, <75% weighted coverage, or both data answers unknown | A00, A01, A02 |
| P1 — Strengthen operating foundations | Process or data upper-bound maturity ≤1.5 | A03, A04, A06 |
| P4 — Streamline digital operations | TEC-01≤2 and TEC-02≤2, both known | A14, A15, A16 |
| P3 — Build people capability | People upper-bound maturity ≤1.5 | A11, A12, A13 |
| P5 — Prepare controlled pilot | ≥90% coverage + named owner + strong governance/data/people/measurement + no blocking gates | A17, A18, A19 |

If no path qualifies, choose P0 / 'Confirm readiness before proceeding' rather than invent eligibility. A person may be strong in one dimension and weak in another; secondary paths may show up to two other triggered priorities.

**Where unknowns occur:** never use a favorable assumed score to trigger P5. Deficiency paths rely on a dimension's **upper bound** meeting the low-maturity threshold; unresolved questions point to P0 instead. Values 0/1 can be legitimate for small firms and should generate appropriately scaled foundations, not stigma.

### Predicate grammar and evaluation

`decision_predicates.json` contains typed `all`, `any`, `not`, `eq`, `in`, `lt`, `lte`, `gte` and `unknown` operators. Canonical paths are `answer.*`, `probe.*`, `profile.*`, `dimension.<id>.lower/upper`, `metrics.*` and `gate.*`. Numeric comparisons with unknown values evaluate false; `unknown` is the only explicit unknown test. Compute gates before paths, then choose the first true path by precedence, else P0. The descriptive English in `rules.json` MUST NOT be executed as code.

### Predicate grammar and evaluation

`decision_predicates.json` contains typed `all`, `any`, `not`, `eq`, `in`, `lt`, `lte`, `gte` and `unknown` operators. Canonical paths are `answer.*`, `probe.*`, `profile.*`, `dimension.<id>.lower/upper`, `metrics.*` and `gate.*`. Numeric comparisons with unknown values evaluate false; `unknown` is the only explicit unknown test. Compute gates before paths, then choose the first true path by precedence, else P0. The descriptive English in `rules.json` MUST NOT be executed as code.

## 5.3 Action ranking and prerequisites

Every action in `action_catalog.json` has immutable ID, title, path, evidence questions, linked dimension, owner role, cost/effort class, prerequisite IDs and a measurable validation check. Prerequisites form an acyclic graph. The selected top three must include prerequisite instructions or first steps that make them feasible; do not recommend A16 purchase evaluation before the firm has mapped handoffs and fields.

When multiple eligible actions remain, rank with proposed weights: deficiency severity 35%, downstream dependency unlock 25%, business-goal alignment 20%, practical feasibility 20%. Formula, normalizations and tie-breaks are specified in `rules.json`; executable predicates are specified in `decision_predicates.json`. **Safety gates always override numeric rank.** If there are fewer than three sound actions, return fewer than three; never pad reports with generic filler.

Each action's narrative template follows: **Do this → Because [supporting evidence] → Who should own it → Effort/cash assumptions → How to check completion → What remains unknown**.

### Generated 30/60/90 indicative sequence

- **0–30 days:** clarify and remove blockers; agree owner, baseline, simple data rule as applicable.
- **31–60 days:** complete the highest-priority prerequisite and measure a representative process.
- **61–90 days:** reassess readiness, prepare a bounded next step *only if control/ownership gates are resolved*.

Do not insert invented savings forecasts, a vendor quotation or a detailed project delivery schedule.

---

# 6. Budget-aware advice without fabricated economics

**Question:** 'What is the maximum external cash spend you could authorize over the next 90 days?' KES is the default; other currencies are permitted but may be treated as unverifiable until source-specific quotes exist. Ask after an initial result, not before value is shown. A ceiling is a ceiling—not a minimum/maximum range. Accept `0`, `unknown`, or nonnegative integer plus currency. Ask separately whether the owner/staff can spend time.

| User-selected budget band | Eligible action cash classes to *consider* | Statement allowed |
|---|---|---|
| None | C0 | No required external cash; staff time remains necessary |
| Limited | C0, C1 | Potential fit; external quotes required |
| Moderate | C0, C1, C2 | Potential fit; external quotes required |
| Flexible | C0–C3 | Feasibility still unconfirmed until cost evidence |
| Unknown | C0 as immediate start; others informational | Affordability unknown |

**Cost classes:** C0 no required external cash, C1 potential low expense, C2 potential moderate expense, C3 specialist quote required. These classifications are internal planning proxies, not Kenyan market prices.

**Exact amount handling:** An action may be labeled **'fits known ceiling'** only when a reviewed, dated quote or cost catalog contains the matching-currency **complete estimated upper bound ≤ budget ceiling**, validated within 90 days, including applicable recurring costs when relevant. Otherwise use `may_fit`, `above_budget` (only if valid estimate lower bound > ceiling), or `unverified`. No FX conversion without a cited rate and date. Numeric quotation catalog is **empty in V1** until approved real-market evidence is collected; the app must therefore never imply guaranteed monetary fit initially.

**Crucial feasibility case:** zero external cash and zero staff capacity do not produce a 'free implementation' recommendation. Suggest a single low-effort self-check or state that no viable implementation activity has been established.

---

# 7. Report, user-controlled handoff and business measurement

## 7.1 Results and report (fully static)

1. Render an accessible HTML results page with the conservative overall score interval, coverage, dimension bars, known/unknown questions, safeguards and evidence limitations.
2. Present up to three traceable readiness actions with supporting answer IDs, owner/role, prerequisites, effort and dated/unverified cash class.
3. Generate a branded local report with date, methodology version and clear disclaimer; use native browser print as **Print / Save as PDF**, not a guaranteed generated file or Blob.
4. Provide a short, plaintext summary, `Copy summary`, and `Share summary` where the browser supports native sharing. Sharing capability must be tested separately from printing.
5. No contact details are required for a report; no consultation or paid service is promised or implied.

**Required footer:** “Self-reported, unverified advisory assessment. Readiness for a specific AI use case, privacy compliance and implementation cost have not been independently assessed.”

## 7.2 V1.2 commercial handoff: voluntary and reviewed

Present **“Contact Silverspark about my results”** below the report. The user sees and can edit the exact outgoing plaintext. After an additional explicit click, open a `wa.me` link to the **verified** Silverspark WhatsApp Business destination; the user must press Send in WhatsApp. Do not embed personal data, full answers, financial records, sensitive workflow narratives or secrets in URL query parameters.

**Suggested payload:** `Silverspark Compass · assessment ID [random opaque ID] · readiness [range/undetermined] · recommendation [approved path ID/name] · action IDs [up to 2] · I would like to discuss the next step.` The text is a convenience, not a signed or authenticated report. The receiver must independently verify or rerun answers for any consequential advice. Never log the constructed URL.

If WhatsApp is unavailable, provide a safe **Copy summary** fallback; the business contact is confirmed before shipping. The existing Silverspark contact number may be used **only after** verifying it can receive WhatsApp enquiries. External contact is clearly labelled as leaving the application, and no client assessment is “received” until the client deliberately sends it.

**Draft schema compatibility:** `profile_schema.json` still retains `report_contact_fields` and optional `source`/`partner` placeholders from the v1.1 contract. Treat contact fields as **inactive/deferred** in V1.2: do not display a contact-entry form, capture contact details or infer an intake backend. Any future activation requires a versioned ADR and human sign-off.

**No forms or endpoints:** do not implement `/api`, `fetch` submissions, Cloudflare Worker/D1, Supabase, Firebase, analytics SDKs, Google Forms or third-party form handlers in this release. Such a change requires a new ADR, privacy review, altered hosting decision and a new approved stage.

## 7.3 Commercial experiment and honest measurement

| Measure | Source for V1.2 | Interpretation |
|---|---|---|
| Starts / completion / abandonment | Consented moderated pilot observation | Sample-only usability finding; not site-wide analytics |
| Question comprehension / unknown rate | Consented interview form and notes | Rubric calibration |
| Consultant usefulness | Independent human review of voluntarily shared reports | Primary north-star validation |
| Contact requests | Messages actually received and manually classified | Not equal to clicks on WhatsApp CTA |
| Deals / revenue | Silverspark manual business records with appropriate notice | Cannot be inferred from local assessment data |

**Commercial risk:** zero backend and static privacy provide simplicity but cannot create an automatic lead database. Preserve this limitation in roadmap and approval documentation instead of promising lead capture that does not exist.

# 8. GitHub Pages-only technical architecture

## 8.1 Runtime and asset flow

```text
    Approved repository (protected main)
                   |
          GitHub Actions CI
       contract validation → lint → typecheck →
         unit/property → build → E2E/a11y → asset checks
                   |
       actions/upload-pages-artifact (./dist)
                   |
         actions/deploy-pages
                   |
     GitHub Pages over HTTPS
 https://<owner>.github.io/silverspark-compass/
                   |
        Static browser application
   wizard → local draft → pure TS evaluator
      → report → user-reviewed share
                   |
       sessionStorage or opt-in IndexedDB
       (no uploads or server submission)
```

**Hard build boundary:** a production build consists of static HTML/CSS/JS/images only. No API route, background Worker, database, edge function, server-rendering runtime, secret-bearing client environment variable or paid hosted AI API. The same `dist/` can be served offline on a local development host for test purposes. GitHub Pages is the configured production deploy in V1.2.

## 8.2 Stack and repository structure

| Responsibility | Tool / strategy | Constraint |
|---|---|---|
| UI | React + Vite + TypeScript `strict` | No framework server dependencies |
| Routing | One-page wizard state or hash routing | Do not rely on GitHub Pages fallback rewrites for deep links |
| Domain | Pure TypeScript evaluator + versioned JSON contracts | No side effects, I/O, hidden AI inference |
| Storage | `sessionStorage` autosave; optional IndexedDB durable save | Store only on device; ability to delete and handle quota errors |
| Validation | Zod (strict boundary parsing) | Safe draft and contract handling; JSON import remains excluded |
| Design | CSS variables/modules and native accessible controls | Navy `#0e1828`, charcoal, off-white and silver; licensed fonts only |
| Report | Semantic HTML and print stylesheet | Non-print report remains complete on mobile |
| Tests | Vitest + fast-check, Playwright + axe-core | CI plus manual real-device evidence |
| Deployment | GitHub Actions → GitHub Pages | No Cloudflare, Wrangler, Vercel or external host in normal path |

```text
/src/app/                 # landing, wizard, results, report and share UI
/src/domain/              # pure evaluate/scoring/gates/path/action selection
/src/content/             # typed loaders and copy; JSON remains in docs/domain
/src/storage/             # autosave, expiry, conflicts, explicit deletion
/src/styles/              # tokens, mobile layouts, accessible components, print
/docs/domain/             # normative proposed domain contracts
/docs/stages/             # S0–S8 execution/acceptance contracts
/docs/handoffs/           # stage handoff template and signed stage records
/docs/adr/                # architecture decision records
/.github/instructions/    # scoped Copilot rules
/.github/prompts/         # one bounded agent prompt per stage
/.github/workflows/       # quality-gated GitHub Pages publication
/tests/unit/              # independent golden and property tests
/tests/e2e/               # accessibility, mobile, navigation, report
/public/.nojekyll         # bypass Jekyll processing for deployed static output
```

## 8.3 GitHub Pages URL and path contract

- **Initial project URL:** `https://<owner>.github.io/silverspark-compass/`, repository `silverspark-compass`, Vite `base: '/silverspark-compass/'`.
- **Root/custom-domain scenario:** if GitHub Pages is configured at `https://compass.example.com/` or `<owner>.github.io/`, Vite base is `'/'`. Configure custom domain in GitHub Pages Settings and DNS; a `CNAME` file is not required for an Actions publishing source. **Custom domain remains optional and is not asserted live.**
- **Build control:** set `VITE_BASE_PATH` from CI and use `base: process.env.VITE_BASE_PATH ?? '/silverspark-compass/'`. This is a public build-time setting, not a secret. Validate it begins/ends in `/` and never contains protocol or traversal. Do not construct absolute root URLs for bundled assets.
- **Navigation:** prefer client state with `#` routing for shareable wizard state; use no PII in hashes, paths or query params. Avoid history-mode paths requiring server-side rewrite on refresh.
- **SPA resilience:** root and direct project-root refresh must work. `public/404.html` may provide a user-friendly not-found page; don't rely on its use as an undocumented router rewrite.
- **Artifacts:** `dist/index.html`, `dist/.nojekyll` and compiled assets. CI tests that `.nojekyll` and `index.html` exist and assets resolve under the chosen base.

## 8.4 Deployment settings and prerequisites

1. Create the repository under an appropriate GitHub account/organization with correct role ownership and MFA. Use a public repo on GitHub Free if applicable; a private repo is not a guarantee the published Pages site is private.
2. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Enable HTTPS enforcement under GitHub Pages settings when available; GitHub Pages supports HTTPS for correctly configured custom domains.
4. Protect `main` with required pull-request approval and required quality checks; restrict the `github-pages` environment to `main`, requiring manual protection if supported by the plan.
5. Use `permissions: contents: read` for quality jobs; in the deploy job grant only `pages: write` and `id-token: write` as required for Pages publication.
6. **Do not deploy on pull requests**. PR jobs perform offline build, tests and browser assertions against a local preview. Deploy only from an approved `main` merge or explicit authorized workflow dispatch.
7. A deployed URL smoke check is required; build and deployment must not be described as verified until smoke tests were actually run. Pin official GitHub Actions to reviewed full commit SHAs.

**Official build reference:** Vite's GitHub Pages guide specifies `/REPO/` base for project sites and `/` for custom domains. GitHub's Pages workflow documentation uses configure-pages, upload-pages-artifact and deploy-pages with required token permissions.

## 8.5 Performance and capabilities

Pre-render or include meaningful static landing content so a slow Android device does not show a blank page before JavaScript. Prefer a short wizard state reducer; code-split report UI; do not load a survey framework unless independently justified. Proposed budgets: entry JS <= 90 KiB gzip, pre-question transfer JS <=160 KiB gzip, lab LCP <=2.5 s on the stated test device/network, subject to validation. Tests must check WhatsApp and Facebook in-app browsers: if print or sharing is limited, users still have HTML results and Copy summary.

# 9. Security, privacy and governance — GitHub Pages mode

## 9.1 Processing and consent boundaries

- **Local answers:** remain in browser memory/session storage, or explicit opt-in IndexedDB. No automatic upload, telemetry, remote analytics, model inference or transmitted questionnaire answers.
- **Hosting provider:** GitHub and the surrounding network may process access/security metadata (IP, user agent and requests); don't state 'nothing is processed'. Show a clear privacy notice and link to appropriate platform privacy information.
- **User-controlled WhatsApp share:** only the approved short summary is prepared; the user edits/previews it and sends it through WhatsApp if they choose. Silverspark then receives the message and must handle contact records according to applicable law and its privacy notice.
- **Kenya:** document whether ODPC controller/processor registration and any processing-purpose exceptions apply, with counsel where material; record jurisdiction and potential international transfer considerations. Do not imply static delivery eliminates obligations.
- **No client secrets:** ask about practices, not account passwords, customer names, financial statements, API keys, personally identifiable customer data or security credentials.
- **Public repo:** put no real client responses, confidential interviews, real customer contact records, private test fixtures or secret tokens in the repository or Actions artifacts.

## 9.2 Honest HTTP control model for GitHub Pages

GitHub Pages does **not** expose arbitrary configurable HTTP security response headers through a `public/_headers` file. Do **not** claim deployed `Content-Security-Policy`, HSTS, `frame-ancestors`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` or `nosniff` headers merely because they appear in source text. Treat provider-controlled headers as externally observed facts, not guaranteed by this application.

For V1.2: use enforced HTTPS, self-hosted fonts and scripts, no third-party trackers, no dangerous HTML injection, strict input handling, and a **meta CSP** after compatibility testing: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`. Note: HTML meta CSP **cannot enforce** `frame-ancestors` or `report-uri`; it is not equivalent to an HTTP response-header CSP. `referrer` meta may limit referrer information but does not set the HTTP header. Do not claim to control HSTS for GitHub's service.

If later security requirements demand strict HTTP response headers or server-side access control, stop and raise an ADR. This is an architectural limit of choosing GitHub Pages, not a problem agents can code around inside a static bundle.

## 9.3 Application-side controls

- Validate persisted draft shapes and sizes with Zod; reject prototype-pollution keys and unsupported schema versions. No public JSON import in V1.2.
- Keep free text short and avoid requested personal data; sanitize outbound share string via allowlist and escaping, enforce <= 1,200 characters before encoding. Never include answers by default.
- Render respondent text as text; no `dangerouslySetInnerHTML`; store no secrets in client environment variables. All frontend build variables are visible to visitors.
- Clearly distinguish reports as **self-reported, unverified**. The exported PDF is not authenticated, tamper-resistant or a certification. Consultant checks underlying responses when independently provided.
- Make all use of `sessionStorage` and IndexedDB resilient to quota/privacy-mode exceptions; allow explicit deletion and describe browser session restoration nuances.
- Apply dependency audit, `npm ci`, committed lockfile and code review. SHA-pin Github Actions as a supply-chain measure, and do not execute unknown third-party install scripts without review.
- Keep nonproduction seed data demonstrably synthetic. Limit linked external destinations to configured Silverspark-owned or chosen contact providers; prevent arbitrary URL generation.

**Prohibited in V1.2:** pretending `_headers` works on Pages, deploying Worker/D1, an authenticated admin dashboard, live form submission, third-party tracking pixels, paid AI calls, unauthorized client data collection or automatic leads syncing.

# 10. Quality-gated GitHub Actions, rollback and operating model

## 10.1 Single deployment pipeline

**Repository implementation file:** `.github/workflows/deploy-pages.yml` (template included in developer kit, becomes runnable after S2 creates package scripts and lockfile). Configure GitHub Pages Source = GitHub Actions.

**On pull requests:** schema and contract validation → lint → strict typecheck → independent unit/property/golden tests → build/asset-path check → Playwright Chromium/Firefox/WebKit critical paths → axe-core audit → upload non-sensitive test evidence for reviewers. **Never deploy a PR**.

**On approved `main`:** rerun full quality gates → build once → upload `./dist` as Pages artifact → deploy via `actions/deploy-pages` under `github-pages` environment → GET deployed site and inspect expected content/assets and HTTPS → store deployment URL/build SHA in release record. Do not claim rollback automatically occurs; document operator action on a failing post-deploy smoke test.

Workflow must use reviewed full-SHA-pinned GitHub Actions, minimum required token permissions, `concurrency.cancel-in-progress: false`, `npm ci`, locked dependencies and an explicit `VITE_BASE_PATH`. CI stage checks reject if app imports a cloud server SDK or includes a `/api` endpoint in the release build. Require named scripts `check:contracts`, `lint`, `typecheck`, `test:unit`, `build`, `test:e2e`, `test:a11y`, `check:assets`; S2 must implement all of them, even if early-stage tests are initially minimal and clearly marked.

**Do not report a passed check until it has executed**. Runtime code is not present in this developer kit and the pipeline has not yet been executed against a built app. Dependencies and action SHA pins should be reviewed on installation.

## 10.2 Recovery plan

- Rollback by redeploying a **known-good tagged commit** through the authorized workflow. Keep an immutable record of deployed release SHA, rule versions, workflow run URL, smoke status and rollback candidate.
- Draft recovery target: <=60 minutes for a faulty static site, contingent on actual rehearsal; not an SLA.
- Maintain offsite controlled copies of the repository, normative domain catalogs and signed handoffs; a second GitHub admin/custodian for account recovery where possible.
- Confirm Pages domain/DNS ownership and GitHub account recovery/2FA. For custom domain later, validate DNS and HTTPS in a dedicated ADR.
- Disaster recovery drill: build known-good commit locally, verify base path, redeploy and confirm a representative assessment. Quarterly rehearsal recommended.
- Draft compatibility: keep previous and current question-bank versions under the agreed retention/migration policy, with clear user messaging on incompatible resumes.

## 10.3 Measurement and support cost

Cash platform requirement: **no mandatory paid hosting, server, AI API, CDN, authentication or database service** for V1.2; GitHub Free eligibility depends on actual plan and public/private repo configuration. Record labour for consultation, authoring, pilot sessions, maintenance, dependency reviews, support and legal advice; those costs are not zero. Browser-side analytics deliberately absent, so do not promise real-time funnel dashboards. Monitor public site availability through manual checks or a separately approved external monitor only if policy permits and privacy requirements are met.

Monthly: review GitHub Pages terms and limits, npm dependency advisories, action SHA drift, accessibility bugs and security advisories. Trigger an ADR when any new feature needs network persistence or sensitive data collection.

# 11. Verification and stage-level acceptance criteria

## 11.1 Domain correctness: independent oracle and invariants

1. Pure `evaluate()` is deterministic; canonical serialization, key order and UI navigation do not affect result.
2. Increasing a known anchor score cannot decrease lower/upper possible score; resolving unknown narrows uncertainty consistently.
3. Budget, currency and staff capacity can affect recommended action feasibility but never numeric readiness scores.
4. Inactive probes are inert; editing a core answer and reverting yields identical evaluation.
5. Critical P6 and unsafe-sharing gates override higher maturity bands as per approved predicates; no arbitrary new gate.
6. All-unknown yields [0,100] and P0; unknown is never silently imputed or assigned to zero as a point estimate.
7. Source IDs, prerequisites, action cost classes, gate conditions and path precedence match approved JSON catalogs.
8. Every golden expectation is independently written, reviewer-signed **before** implementing evaluator. Synthetic fixtures are not genuine pilot evidence.
9. Printable reports always carry methodology version, self-report status, limitation text and source traceability.
10. Share preview shows exact payload. No private answers in URL, log, network request or unexpected remote domain.

## 11.2 Browser, accessibility and deployment tests

- Desktop Chrome, Firefox, Safari and Edge as feasible; Android Chrome on actual low-end device and iOS Safari real-device spot-check. Playwright browsers approximate but do not replace device tests.
- 320px viewport; keyboard-only traversal; screen reader spot test; zoom to 200% and 400%; WCAG 2.2 AA checklist; zero critical axe issues in audited journeys.
- Session storage blocked/full, private browser, returning to assessment, expired draft, contradictory conditional evidence, edit/revert, unknown-heavy answers, no budget, zero staff capacity and report print/share fallback.
- GitHub Pages **subpath** smoke; explicit `index.html` and `.nojekyll`; no root-broken assets; no history route 404; HTTPS response; no unintended network endpoints; Pages build/release proof.
- Risk and privacy copy tested with a real human reviewer; no automatic “AI certification”, unsupported pricing or false compliance claim.

## 11.3 Launch gate

- [ ] S0 discovery pilot conducted (10–15 consenting cases) or an explicitly approved limited showcase release with no validated-claims language.
- [ ] S1 rubric, case expectations, actions and predicates approved by human + independent reviewer.
- [ ] S2 pipeline gates and subpath checks demonstrably pass in GitHub Actions.
- [ ] S3–S5 complete acceptance evidence and signed stage handoffs.
- [ ] S6 cross-browser, real device, WCAG, security/privacy and regression checks completed.
- [ ] S7 GitHub Pages workflow deploy succeeded and live public URL passed smoke tests.
- [ ] GitHub Pages usage for the intended public/commercial purpose reviewed against current terms; **do not publish a prohibited commercial SaaS/online business on Pages**.
- [ ] Contact destination confirmed; results accessible without sharing; external navigation disclosed.
- [ ] Rollback to known-good commit documented; release versions and operator named.

No documentation-only claim of “deployed”, “validated” or “working” substitutes for actual executed evidence.

# 12. Agent-optimized staged execution and handoff protocol

## 12.1 Program execution rule

**One stage, one scoped agent task, one independently reviewed handoff at a time.** Do not give an agent the entire product and ask it to build everything. All stages use the *same* domain catalogs and preserve approved IDs. Each stage reads `AGENTS.md`, the relevant `docs/stages/S*.md` and **only** the contextual contracts needed for its work. Output must be testable and reviewer-readable without relying on the agent's chat history.

| Stage | Agent work package | Preconditions | Acceptance and handoff |
|---|---|---|---|
| **S0 — Validate problem** | Concierge pilot instrument and anonymised study notes | Initial hypothesis and consent plan | 10–15 documented interviews; usefulness/comprehension results; independently reviewed sample |
| **S1 — Freeze domain** | Rules, schema and fixtures audit (no evaluator implementation) | S0 handoff accepted | 14-item bank, 7 probes, path/gate/24-action catalog approved; golden outputs independently labelled |
| **S2 — Repository & Pages foundation** | Vite scaffold, design tokens, scripts, Actions build/deploy skeleton, initial static landing | S1 approved, GitHub repository exists | `npm ci` and checks runnable, Pages subpath build, quality pipeline and test skeleton reviewed |
| **S3 — Guided assessment UX** | Accessible progressive wizard, routing, session/durable save and recovery | S2 accepted | End-to-end navigation, edit/revert state, draft expiry/storage failure, real-device basic test |
| **S4 — Readiness engine** | Pure evaluate, interval scoring, probes, gates, paths, budget classes, action selection | S3 UX and S1 rubric approved | Golden + property tests pass; independent reviewer accepts no false-safe critical cases |
| **S5 — Report & handoff** | Results dashboard, HTML/print, consented review-copy/WhatsApp actions | S4 accepted | Accurate sources/version, excellent responsive UX, copied/WhatsApp exact-preview text, no automatic transmission |
| **S6 — Independent QA & hardening** | Browser tests, a11y, privacy, dependency/cost/performance, regression and failure modes | S5 accepted | Signed QA matrix and risk assessment; no critical accessibility or safety defects |
| **S7 — Publish GitHub Pages** | Merge gate, Pages deploy, live smoke, release record and rollback rehearsal | S6 accepted + Pages terms suitability decision | Live URL and commit SHA evidenced; tested HTTPS/assets/routing; release signed |
| **S8 — Calibrate & maintain** | Compare useful cases, collect consented feedback, version improvements | S7 accepted | Monthly evidence ledger; backlog prioritized; no silent breaking of historic answers |

S0 and S1 are business/research gates, not instructions for coding agents to fabricate respondents or validation. If S0 cannot be completed, S2 may produce a clearly labeled internal **showcase prototype** only with no claim of validated scoring, and S7 commercial release stays blocked.

## 12.2 Required handoff packet and acceptance

Every stage creates `docs/handoffs/S{N}-handoff.md` conforming to `docs/handoffs/HANDOFF_TEMPLATE.md` and updates `docs/handoffs/ledger.json`. Required fields:

- **Stage and authority:** owner agent/session (where available), human reviewer, date, status `draft | review_requested | approved | blocked`, exact input handoff ID and current contract versions.
- **Scope and changes:** requirement IDs addressed, files created/changed, avoided/non-goal files, change rationale, ADR links.
- **Evidence:** exact commands run and outcomes; test counts and failing cases; manual devices/browsers; links to CI workflow or evidence artifact; commit SHA when available. `not_run` is not `passed`.
- **Governance:** open risks, unresolved product/legal questions, known regressions, deviations and rollback method.
- **Exit contract:** pass/fail against numbered stage acceptance criteria, independent reviewer approval, and unambiguous next-stage inputs.

**Gate algorithm:** stage N+1 cannot start until the ledger marks stage N `approved` by a *human*, and previous stage's required artifacts exist. Separate the authoring agent from the reviewing agent; do not let an LLM self-approve. A blocked stage produces a correction PR, not a downstream continuation. Approval records are controlled repo content; they are not cryptographic attestations.

## 12.3 Handoff consistency and change control

1. Document version `1.2.0` does **not** silently change v1.1 proposed rule JSON versions. Changing score/path semantics requires a new domain version, golden-case diff, reapproval and report-version entry.
2. On reopening a stage, compare its input artifact hashes and versions to ledger; refuse to work from stale evidence. Generate new handoff revision if assumptions have changed.
3. Keep PRs vertical and small: one behavior with code, tests, UX evidence and document diff. Don't parallelize changes to shared score catalogs and UI that relies on them.
4. For a future agent session, use its stage-specific `.github/prompts/S{N}.prompt.md`; it should summarize input/output/acceptance from files, not from chat history.
5. No agent may change host to Workers, Cloudflare, Vercel or any serverless service without a signed architecture-change request. The agent can **surface** a limitation, not override user instructions.
6. Every PR contains a brief “Risk / Test / Handoff” report. At stage closure a human merges the approved PR and signs the handoff.
7. Agents may draft test code, but expected business outcomes for golden cases must come from an independent consultant reviewer before implementation.

## 12.4 Codex first task

Start with **S0 readiness assessment audit**, not full scaffold. Validate that the study form and current proposed 14-question bank can be understood without a technical consultant, generate an anonymous pilot worksheet and list specific unresolved predicates. Once real S0 data are provided, create the S0 handoff for human review. Do not claim interviews were conducted. `CODEX_STARTER_PROMPT.md` and stage prompts provide exact scope.

# 13. Premortem, trade-offs and reversal conditions

| Failure mode | Early signal | Mitigation / decision |
|---|---|---|
| GitHub Pages policy conflicts with commercial intent | Business is primarily SaaS or transactional lead service | Stop commercial rollout on Pages, preserve static demo, request explicit hosting-decision amendment |
| Agents build everything without validation | Broad PR, guessed predicates, no pilot evidence | S0/S1 signed gates and stage-limited task prompts |
| Agent-to-agent context is lost | “I think previous agent decided…” without files | Committed stage handoffs + ledger + immutable domain versions |
| Wrong Vite base path breaks CSS/JS | 404 on `/assets/*` at `/silverspark-compass/` | Contract and deployed-URL smoke checks; explicit `VITE_BASE_PATH` |
| False promise of security headers | `_headers` included but ignored on GitHub Pages | Only assert observed/implemented controls; document meta CSP limits |
| Generic readiness advice | P0/P2 dominates cases or actions cannot be explained | Concierge validation, golden cases, conditional safeguards, advice traceability |
| Users fail to finish or resume | Lost tabs, jargon, broken embedded browsers | Progressive start, autosave, plain-language questions, share fallback |
| Privacy or lead claims are false | Hidden analytics or assumption that WhatsApp link means received | No background transport, explicit user review, actual-message manual logging only |
| Static report is mistaken for certification | Stakeholders quote numeric score as verified | Disclaimers, conservative interval, evidence labels, human consult option |
| Expensive vendor sprawl | New packages, server endpoint or AI SDK added by agent | Dependency audit, hard static-only CI contract, ADR approval |
| Bad deployment persists | `main` merged with failures or no rollback SHA | Protected branch, gated Pages Actions, release record, known-good rollback |

**Reversal triggers:** significant pilot comprehension failure → simplify questions; critical false-safe case → block release; legal/Pages usage incompatibility → stop public commercial use and resolve hosting requirement; necessity of server-side intake → new product/hosting ADR; no useful consulting signal after two iterations → retire instrument or keep only educational version.

# 14. Verified primary-source register — 2 November 2026

**Hosting and build**

1. GitHub Pages Additional Terms and commercial-use restrictions: https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features
2. GitHub Pages limits and static restrictions: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
3. Vite: Deploying a static site to GitHub Pages (base and Actions): https://vite.dev/guide/static-deploy.html
4. GitHub: custom Actions workflows for Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
5. GitHub: configuring GitHub Pages publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
6. GitHub: HTTPS enforcement: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
7. GitHub: custom domain with Pages Actions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

**Agent workflows**

8. OpenAI Codex development workflow, phases and AGENTS.md: https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
9. GitHub Copilot repository and path-specific custom instructions: https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions
10. GitHub Copilot customization cheat sheet: https://docs.github.com/en/copilot/reference/customization-cheat-sheet

**Quality, risk and data**

11. W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
12. OWASP ASVS 5: https://asvs.owasp.org/
13. NIST AI RMF: https://airc.nist.gov/airmf-resources/airmf/
14. ISO/IEC 42001 overview: https://www.iso.org/standard/81230.html
15. Kenya ODPC FAQ: https://www.odpc.go.ke/faqs/

**Source governance:** vendor conditions and tool versions change; inspect on deployment date. Silverspark's score rubric, budget classes, acceptance thresholds and stage gates are proposed internal design decisions, not standards-certified findings.
