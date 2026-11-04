# SILVERSPARK COMPASS
## Product Technical Specification — AI Readiness & Prospective Client Discovery

**Version:** 1.3.1 — 3 November 2026
**Status:** Proposed product contract; not yet empirically calibrated or implemented  
**Product owner:** Silverspark Consulting · Strategy in Action  
**Deployment requirement:** GitHub Pages static artifact; React + Vite + TypeScript; zero paid runtime APIs  
**Engineering model:** Codex/Copilot staged agents, separate human product approval, signed handoffs  
**Scope:** Progressive AI readiness discovery, risk and capacity assessment, practical budget-aware next steps, branded report, voluntary prospect handoff  
**Source of truth:** v1.2 core domain files plus v1.3 technical extension and discovery/report requirements. Where this specification and a machine-readable contract conflict, S1 must resolve and sign the difference before coding.  

> **Deployment policy hold:** GitHub Pages is technically capable of hosting this static browser app, but GitHub says Pages must not primarily operate an online business, commercial transactional site or SaaS. A public prospect-generation service must obtain an appropriate hosting-terms determination before launch. No hidden paid backend has been substituted. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

> **Methodology declaration:** Silverspark's questions, scoring and recommendations are *original draft instruments inspired by* Microsoft AI Readiness Assessment and AWS Prescriptive Guidance. They are **not** their official questionnaires, not endorsed by either vendor, and not scientific, security, regulatory or standards certification.

---

## 1. Executive product definition and intended business outcome

**Problem:** Prospective clients approach Silverspark with ambiguous ambitions such as “we want AI”, limited knowledge of their data/process/systems, and no reliable view of readiness. Silverspark must otherwise repeat discovery manually, cannot consistently compare prospects, and risks recommending tools before verifying workflow, data, governance and implementation capacity.

**Product:** A premium, mobile-first browser assessment that asks accessible questions, adapts to company size and AI experience, records a clear evidence trail, detects readiness gaps and critical risks, recommends affordable next steps without exaggerating confidence, and creates a report that the prospective client may voluntarily share with Silverspark.

**Users:** (1) sole proprietor/business owner; (2) SME decision-maker; (3) department manager; (4) enterprise technology/AI lead; (5) Silverspark reviewing consultant. **Not** a CRM, client database, model hosting platform or paid SaaS in V1.

**Outcomes:** Client understands their readiness and next action; Silverspark receives only voluntarily shared findings and can undertake a faster follow-up call; no automatic collection or paid inference is required. A referral or consultation click is not a confirmed lead. The application must not imply that a readiness score approves a particular AI use case.

**Success hypotheses (to validate before production):** meaningful differentiation of SME maturity; recommendations usable without a consultant; fewer irrelevant discovery questions; mobile completion; credible consented enquiries; lower consultant prep effort. Use the existing S0 pilot thresholds in the v1.2 blueprint, not invented post-launch conversion data.

### Explicit exclusions

No live chat LLM/API inference; no OAuth or account registration; no server database; no automatic lead ingestion; no CRM sync; no upload of customer documents; no custom AI model deployment; no AI vendor cost quote; no live payments; no cross-client benchmarking; no certification claims; no on-chain or encrypted client identity. GitHub Pages means no server execution and no reliable server-side access enforcement.

---

## 2. Research-to-feature traceability: what we adopt and what we do not

**Microsoft source:** [AI Readiness Assessment](https://learn.microsoft.com/en-us/assessments/94f1c697-9ba7-4d47-ad83-7c6bd94b1505/) describes **seven pillars** and personalized recommendations: Business Strategy; AI Governance & Security; Data Foundations; AI Strategy & Experience; Organization & Culture; Infrastructure for AI; Model Management. Microsoft's tool lists **45** questions. We do not copy its questions or use its brand as a product endorsement.

**AWS source:** [Generative AI workload assessment questionnaire](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-workload-assessment/questionnaire.html) covers readiness, use cases, architecture, storage, regulations/compliance, integration, testing, deployment/automation and data strategy. AWS's framework is deeper, architecture/workload-oriented. It is applied conditionally rather than to every shop owner.

### 2.1 Microsoft pillar crosswalk

| Microsoft-inspired area | Compass core indicators | Optional diagnostic contribution | Expected evidence |
|---|---|---|---|
| Business Strategy | STR-01, STR-02, MET-01 | EX-RDY-01, EX-USE-02 | Goal, authorization, financial/operational baseline |
| AI Governance & Security | GOV-01, GOV-02 | EX-CMP-01/02, EX-ARC-02 | Data classification, restrictions, human authority |
| Data Foundations | DAT-01, DAT-02 | EX-STO-01/02, EX-DTS-01/02 | Source quality, location, access, stewardship |
| AI Strategy & Experience | STR-01, PEO-01, profile.current_ai_use | EX-ARC-01, EX-USE-01 | Existing use, intended capability, use-case clarity |
| Organization & Culture | PEO-01, PEO-02, STR-02 | EX-RDY-01/02 | Skills, adoption willingness, resources and owner |
| Infrastructure for AI | TEC-01, TEC-02 | EX-INT-01/02, EX-DEP-01 | Integration, source of record, continuity |
| Model Management | GOV-02, MET-02 | EX-TST-01/02, EX-DEP-02 | Evaluation, monitoring, fallback, lifecycle owner |

**Scope honesty:** The 14-question core is an organizational *screen*, not a 45-question Microsoft-equivalent. The optional technical annex gives depth but still does not constitute formal workload architecture due diligence or model validation.

### 2.2 AWS technical areas crosswalk

| AWS-inspired domain | Compass extension | Assessment implication |
|---|---|---|
| Readiness | EX-RDY-01 / EX-RDY-02 | Responsible owner, available execution capacity |
| Use cases | EX-USE-01 / EX-USE-02 | Selected workflow, success measure |
| Architecture | EX-ARC-01 / EX-ARC-02 | Build/integrate expectation and human fallback |
| Storage | EX-STO-01 / EX-STO-02 | Where source information lives and how to correct it |
| Regulations and compliance | EX-CMP-01 / EX-CMP-02 | Data sensitivity and controls (not a legal opinion) |
| Integration | EX-INT-01 / EX-INT-02 | Data access method and authoritative system |
| Testing | EX-TST-01 / EX-TST-02 | Evaluation set, edge cases and human review |
| Deployment and automation | EX-DEP-01 / EX-DEP-02 | Continuity, cost/quality monitoring and ownership |
| Data strategy | EX-DTS-01 / EX-DTS-02 | Data quality and stewardship |

**Source references for targeted technical controls:** AWS [testing](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-workload-assessment/testing.html), [data strategy](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-workload-assessment/data-strategy.html), [integration](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-workload-assessment/integration.html), and [regulations/compliance](https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-workload-assessment/regulations-and-compliance.html).

---

## 3. End-to-end client and Silverspark workflow

```
Landing / privacy explanation
  → org type + industry + business goal (3 fields)
  → 5-question quick preview [limited observations, no definitive band]
  → 9 remaining scored core questions [14 universal in total]
  → only triggered evidence probes (up to 7; different from anchor questions)
  → business context: workflow, systems, friction and success measure (optional)
  → optional extended technical assessment (18 questions; only relevant questions shown)
  → capacity, timeline, budget ceiling, sensitive/high-impact use flags
  → pure evaluate(profile, answers, activeProbes, extension)
  → readiness interval + seven dimensions + gates + top 3 feasible actions
  → full HTML report + print/save-as-PDF + summary copy
  → voluntary WhatsApp contact / consultation request; user approves transfer
  → Silverspark consultant separately records enquiry, validates assertions,
     maps suitable service, decides whether to offer a diagnostic engagement
```

### 3.1 Assessment states and transitions

`landing → profile_minimal → preview_questions → interim_preview → core_questions → triggered_probes → context → [extended_opt_in → extended_questions] → constraints → review → evaluation → results → [share|print|local_save]`.

- Every forward transition validates the current question only; Back preserves state. Review may edit earlier answers and re-evaluates dependent probe visibility.
- Do not require contact details or budget to access scores. Missing budget means recommendations state **cost fit unknown**, with no-cash steps where available.
- The optional extended mode never retroactively changes core maturity scores. It adds risk/evidence findings and a technical readiness annex.
- Saving a local draft must be transparent; avoiding telemetry is not the same as the hosting provider processing no request metadata.
- If a browser in-app WebView cannot print or download, the full HTML results and a copyable summary remain usable.

### 3.2 Prospective-client journeys

**J1 — Owner Operator:** Sole proprietor using WhatsApp and spreadsheets. Expected outcome: practical low-cash steps; no enterprise governance penalty merely for lacking a department.

Journey states: `landing → start_3 → quick_5 → preview → core_remaining_9 → context_optional → constraints_optional → results → download_or_share`.

**J2 — Sme Manager:** SME with scattered tools and basic accounting. Expected outcome: identifies reconciliation friction and readiness gaps; precise action owner.

Journey states: `landing → start_3 → quick_5 → preview → core_remaining_9 → evidence_probe → value_stream → budget → results → report → consented_handoff`.

**J3 — Enterprise It Lead:** Team already piloting or deploying AI. Expected outcome: AWS-style tech diligence with model evaluation and monitoring gaps without duplicate core-scoring.

Journey states: `landing → start_3 → core_14 → expanded_opt_in → technical_modules_conditioned → risk_checks → results → technical_annex → report`.

**J4 — Unsure Respondent:** Unknown answers and scarce information. Expected outcome: 0-100 possible if all unknown, no false zero or blocked output.

Journey states: `start_3 → core_14_with_unknowns → results_interval → verify_actions`.

**J5 — Regulated Workflow:** High impact decision + intended AI use. Expected outcome: specialist review first despite a strong maturity score.

Journey states: `core → high_impact_profile → safety_gate → specialist_review_path → report`.

**J6 — Consultant:** Silverspark receives client-approved summary and separately provided report. Expected outcome: manual review clearly separates client-reported facts from verified facts.

Journey states: `receive_explicit_handoff → record_source → confirm_answers_with_client → recompute_if_structured_answers_available → review_gaps → agree_next_meeting → document_consultant_decision`.

### 3.3 Consultant-side workflow (required even without a backend)

1. Receive the prospect's voluntarily transmitted summary; record the channel and whether the full report was supplied.
2. Open a separate Silverspark consulting record outside Compass. Assign a review owner; treat assessment ID as an opaque reference, not a verified identity.
3. Reconfirm the **business goal, value stream, current operational bottleneck, budget authorization, execution owner and data category** with the prospective client.
4. Validate self-reported findings; ask for proof where the risk or commercial recommendation depends on it. Never trust an uploaded score as authoritative; recompute from any valid structured answers.
5. Review gate and evidence notes before discussing an AI pilot. Do not propose a pilot if a blocking control or specialist review is outstanding.
6. Match the prospect to Silverspark's **AI Transformation, AI Enablement, Digital Systems, Delivery Partnerships or Technology Advisory** service, or recommend independent/no-cost action.
7. Record consultant-approved next steps with owner, decision date, potential scope and outstanding verification. Compass itself does not create CRM entries on GitHub Pages.

**Commercial handoff limit:** A prefilled WhatsApp URL conveys a brief, user-reviewed **non-sensitive summary only**. It does not send automatically and cannot prove receipt. Exact address and credentials are configured and reviewed by the operator before release. The complete report is transmitted separately at the user's explicit choice.

---

## 4. Intake and discovery data contract

**Source contracts:** `docs/domain/profile_schema.json` (preexisting core profile), `docs/domain/prospective_client_discovery.json` (new optional fields). Answer schemas require stable IDs and allow `unknown`/`prefer_not_to_say` wherever relevant.

### 4.1 Identity-free start

| Field | Values/format | Use | Required upfront |
|---|---|---|---|
| `org_type` | sole proprietor, small/established SME, enterprise, nonprofit, other | wording and examples; not scoring | Yes |
| `industry` | sector enum | contextual examples and specialist flag prompts; industry alone never triggers a legal verdict | Yes |
| `primary_goal` | efficiency, growth, service, risk, exploration | tailor actions and content | Yes |

### 4.2 Commercial and business-process discovery

| Field | Data type | Why it exists |
|---|---|---|

| `business_size` | enum (solo, 2_9, 10_49, 50_249, 250_plus, unknown) | Translate recommendations to a realistic business scale |

| `commercial_model` | enum (services, products, subscription, project, hybrid, other, unknown) | Recognize how value is captured |

| `value_stream` | enum (lead_to_sale, order_to_cash, service_to_resolution, procure_to_pay, hire_to_retire, report_to_decision, other, unknown) | Locate where value is created or lost |

| `workflow_frequency` | enum (many_daily, daily, weekly, monthly, unknown) | Estimate importance of repeated effort without fabricating cost |

| `workflow_bottleneck` | enum (waits, manual_entry, errors, rework, lost_leads, knowledge_search, compliance, other, unknown) | Tie diagnosis to an observed operational issue |

| `workflow_systems` | multi_enum (paper, whatsapp, spreadsheets, email, accounting, crm, erp, pos, other, unknown) | Discover the existing tools and data path |

| `impact_measure` | enum (time, cost, revenue, quality, risk, customer_experience, unknown) | Choose a sensible improvement measure |

| `baseline_known` | enum (yes, estimated, no, unknown) | Prevent unsupported ROI predictions |

| `budget_window` | enum (one_off_90_days, monthly_recurring, no_external_spend, prefer_not_to_say) | Distinguish upfront spend from recurring spend |

| `monthly_budget_ceiling` | nonnegative_integer (nonnegative_integer) | Check ongoing affordability only with reviewed costs |

| `decision_authority` | enum (respondent, shared, other, unknown) | Flag authorization gap |

| `preferred_next_step` | enum (self_guided, training, consultant_review, implementation_discussion, unsure) | Allow the client to choose consultation or self-help |

| `optional_context` | string (string) | Add concise context without secrets |

### 4.3 Additional guardrail inputs

Collect `country`, `current_ai_use`, `planned_ai_use`, `planned_use_real_data`, `data_category`, `high_impact_ai_workflow`, `staff_capacity`, `timeline`, one-off 90-day `budget_ceiling`, and qualitative `budget_band` using the existing profile contract. A numeric budget is an **authorization ceiling** for a particular time window, not a forecast or price.

**Data classification:** routine business information, personal information, restricted/confidential information, or unknown. Customer phone numbers count as personal information. These categories inform additional questions and cautions; they do not themselves establish noncompliance. Any AI use supporting healthcare, credit, hiring or equivalent consequential decisions requires targeted specialist review before proceeding.

**Privacy minimization:** No default demand for business name, email, address, customer names, bank numbers, KRA PIN, medical records or credentials. Optional 240-character contextual note must warn against identifying/confidential details. Optional contact requested only at explicit off-site handoff; it is not stored by Compass.

---

## 5. Core readiness assessment — full 14-question instrument

This is the actual core content inherited from v1.2. All seven dimensions have two anchored indicators. Each has five maturity descriptions (`L0` through `L4`) plus `UNK` (I am not sure). These are proposed labels requiring moderated validation, not proven statistical measures.

### STR — Business & Strategy · 15%

**STR-01** — How clearly do your plans for using AI or automation connect to a business goal?

- `STR-01-L0` → 0: We have not identified a specific business goal.
- `STR-01-L1` → 1: We have some ideas but no agreed outcome.
- `STR-01-L2` → 2: We have chosen a goal but no way to measure it.
- `STR-01-L3` → 3: We have a clear goal and know what improvement would look like.
- `STR-01-L4` → 4: We review results against goals and adjust our plans.
- `STR-01-UNK` → unknown: I am not sure

**STR-02** — Who can decide whether to introduce a new tool or change the way work is done?

- `STR-02-L0` → 0: No one has a clear responsibility for that decision.
- `STR-02-L1` → 1: Decisions happen informally when a problem comes up.
- `STR-02-L2` → 2: A person usually decides, but responsibilities are not always clear.
- `STR-02-L3` → 3: There is a clear decision owner and a simple approval process.
- `STR-02-L4` → 4: Decisions have clear owners and are reviewed for business impact.
- `STR-02-UNK` → unknown: I am not sure

### PRO — Processes & Workflows · 15%

**PRO-01** — How consistently is your most important repeatable work carried out?

- `PRO-01-L0` → 0: We work differently each time; the steps are not clear.
- `PRO-01-L1` → 1: We mostly rely on habit or what individuals remember.
- `PRO-01-L2` → 2: We use common steps but they are not always followed.
- `PRO-01-L3` → 3: We have repeatable steps that people normally follow.
- `PRO-01-L4` → 4: We review the steps, measure delays, and improve them.
- `PRO-01-UNK` → unknown: I am not sure

**PRO-02** — How do you find out where work gets delayed, repeated, or done incorrectly?

- `PRO-02-L0` → 0: We rarely identify recurring problems.
- `PRO-02-L1` → 1: We notice problems when a customer or colleague complains.
- `PRO-02-L2` → 2: We discuss recurring problems but do not track them.
- `PRO-02-L3` → 3: We record the main recurring problems and act on them.
- `PRO-02-L4` → 4: We track patterns, investigate causes, and verify improvement.
- `PRO-02-UNK` → unknown: I am not sure

### DAT — Data Readiness · 15%

**DAT-01** — How reliable are the records you use to make everyday business decisions?

- `DAT-01-L0` → 0: Important records are often missing or unusable.
- `DAT-01-L1` → 1: Records exist but are frequently incomplete or out of date.
- `DAT-01-L2` → 2: Most records are usable but require occasional correction.
- `DAT-01-L3` → 3: Important records are usually accurate and easy to find.
- `DAT-01-L4` → 4: We regularly check record quality and fix recurring errors.
- `DAT-01-UNK` → unknown: I am not sure

**DAT-02** — Who makes sure important business records stay up to date and accessible?

- `DAT-02-L0` → 0: Nobody takes responsibility for maintaining our records.
- `DAT-02-L1` → 1: People update records when they remember or have time.
- `DAT-02-L2` → 2: Someone usually maintains records, but checks are informal.
- `DAT-02-L3` → 3: Responsibilities and access rules are clear for key records.
- `DAT-02-L4` → 4: We review responsibilities, access, and record quality regularly.
- `DAT-02-UNK` → unknown: I am not sure

### TEC — Technology & Systems · 15%

**TEC-01** — Where do you keep the records used to run your business?

- `TEC-01-L0` → 0: Most important records are on paper or in personal messages.
- `TEC-01-L1` → 1: Digital records exist but are scattered across separate files and tools.
- `TEC-01-L2` → 2: We use digital tools with a reasonably consistent record-keeping method.
- `TEC-01-L3` → 3: Our key digital systems are dependable and have clear owners.
- `TEC-01-L4` → 4: We monitor systems and regularly improve how information is managed.
- `TEC-01-UNK` → unknown: I am not sure

**TEC-02** — When information is needed from different systems, how is it combined?

- `TEC-02-L0` → 0: We often cannot combine the information when needed.
- `TEC-02-L1` → 1: We usually copy or type the same details again.
- `TEC-02-L2` → 2: We regularly use exports or some basic system connections.
- `TEC-02-L3` → 3: Key systems exchange information reliably, with checks.
- `TEC-02-L4` → 4: We monitor connected systems and routinely resolve data-transfer problems.
- `TEC-02-UNK` → unknown: I am not sure

### PEO — People & Adoption · 15%

**PEO-01** — How confident are you and the people helping you in using AI safely and checking its work?

- `PEO-01-L0` → 0: We have little or no experience with AI tools.
- `PEO-01-L1` → 1: Some people experiment but rarely check the outputs.
- `PEO-01-L2` → 2: We know common uses and usually check important outputs.
- `PEO-01-L3` → 3: People have guidance and can spot common AI mistakes.
- `PEO-01-L4` → 4: We routinely evaluate AI use and improve skills from findings.
- `PEO-01-UNK` → unknown: I am not sure

**PEO-02** — When you introduce a new way of working, how do people learn and adapt?

- `PEO-02-L0` → 0: We rarely explain or support changes.
- `PEO-02-L1` → 1: People usually work things out themselves.
- `PEO-02-L2` → 2: We offer occasional help when someone asks.
- `PEO-02-L3` → 3: We plan basic guidance and nominate someone to help.
- `PEO-02-L4` → 4: We review uptake and change training based on feedback.
- `PEO-02-UNK` → unknown: I am not sure

### GOV — Governance & Security · 15%

**GOV-01** — What rules protect customer, employee, and confidential information when using digital or AI tools?

- `GOV-01-L0` → 0: We have not considered rules for this information.
- `GOV-01-L1` → 1: We rely on individual judgment; safeguards are unclear.
- `GOV-01-L2` → 2: Some basic precautions exist but are not consistently applied.
- `GOV-01-L3` → 3: Clear rules cover what may be shared, access, and checking.
- `GOV-01-L4` → 4: We review safeguards and act when mistakes or risks are found.
- `GOV-01-UNK` → unknown: I am not sure

**GOV-02** — How are important AI-assisted decisions checked before anyone acts on them?

- `GOV-02-L0` → 0: There is no clear checking or escalation practice.
- `GOV-02-L1` → 1: People may check results, but it is not expected.
- `GOV-02-L2` → 2: Important outputs are usually checked by a person.
- `GOV-02-L3` → 3: People know when to review, approve, or stop AI-assisted work.
- `GOV-02-L4` → 4: We monitor errors and improve review and escalation rules.
- `GOV-02-UNK` → unknown: I am not sure

### MET — Measurement & Execution · 10%

**MET-01** — Can you measure whether your most important business process is improving?

- `MET-01-L0` → 0: We have no usable measure of performance.
- `MET-01-L1` → 1: We rely mainly on impressions or informal feedback.
- `MET-01-L2` → 2: We measure one or two things but not consistently.
- `MET-01-L3` → 3: We have a starting measure and check progress regularly.
- `MET-01-L4` → 4: We verify outcomes against the baseline and refine our measures.
- `MET-01-UNK` → unknown: I am not sure

**MET-02** — After making a business change, how do you make sure it works?

- `MET-02-L0` → 0: We do not follow up on changes.
- `MET-02-L1` → 1: We check only if someone reports a problem.
- `MET-02-L2` → 2: Someone follows up informally when there is time.
- `MET-02-L3` → 3: An owner checks results at an agreed point.
- `MET-02-L4` → 4: We monitor results, document lessons, and improve our approach.
- `MET-02-UNK` → unknown: I am not sure

### 5.1 Presentation and comprehension rules

- Show practical examples (one-person shop, office, growing SME) *as help text*, not as different hidden scores. Use neutral wording: “you or anyone who helps you” where relevant.
- Single-selection options must be accessible radio choices; never show the numeric maturity value while answering, to reduce gaming.
- `UNK` is always allowed. Unknown is **not** zero, and skipped/unknown answers widen the outcome interval. Track unknowns as explicit verification needs.
- If a response changes, recompute from the full current state; activated probes update and no orphaned hidden answer contributes to the report.
- 14 core questions are universal; no implicit enterprise-only N/A exemptions. Executive scoring depends on applicable actions, not whether the company has formal job titles.

### 5.2 Conditional evidence probes

The seven existing `docs/domain/probes.json` probes ask for a **different observation** than their anchor question: e.g., number of cross-system copies in the past week, a recent data error, or whether unapproved sensitive information was entered into AI tools. Probes do not change numeric core maturity. Their answers can inform safety gate evidence, unresolved contradictions and concrete next steps.

**Technical continuation example:** If a client reports scattered digital records (`TEC-01/TEC-02` low), ask how often the same information was copied into multiple systems during the previous week. Interpret this as observed workflow friction, **not proof that the underlying records are inaccurate**. If an answer conflicts with a high maturity anchor, display an editable inconsistency review rather than silently adjusting the score.

---

## 6. Optional AWS-inspired extended technical assessment (18 questions)

**Entry:** After core readiness, user explicitly selects “Assess my AI implementation readiness in more detail.” This is useful for firms already piloting AI or planning a specific implementation, and is not required for a free readiness report. Questions marked `ALL` run in extended mode; `AI_INTENT` runs only for current AI use or planned AI; `CURRENT_OR_PLANNED` requires a team pilot, an operational AI system or planned AI. Do not ask a sole proprietor about Kubernetes, GPUs or MLOps unless their context actually makes it relevant.

**Important:** This technical module adds **diagnostic flags only**. It does not yield a second number or change any of the 14-question score weights. Technical findings can map to existing action IDs, but changing a hard gate requires a signed update of the existing decision predicates and fixtures.

### RDY — Organisational readiness (AWS: readiness)

**EX-RDY-01** — What concrete evidence shows who can approve or stop an AI trial?  
Shown when: `ALL`; related dimension: `STR`.

- `owner` — A named person has approved or stopped a recent change
- `informal` — Decisions usually happen informally; there is no recorded example
- `none` — No one has authority to make that decision
- `unknown` — I am not sure

**EX-RDY-02** — What resources can be committed to a safe AI experiment?  
Shown when: `ALL`; related dimension: `MET`.

- `funded` — Time and a small budget are authorized
- `time` — Time is available but cash is limited
- `uncommitted` — Neither time nor spending is committed
- `unknown` — I am not sure

### USE — Use-case definition (AWS: use cases)

**EX-USE-01** — Which single activity would you most want to improve?  
Shown when: `ALL`; related dimension: `PRO`.

- `customer` — Customer service or follow-up
- `sales` — Sales or marketing
- `operations` — Operations or administration
- `analysis` — Reporting or analysis
- `other` — Another activity
- `unknown` — I have not chosen

**EX-USE-02** — How would you know that this activity improved?  
Shown when: `ALL`; related dimension: `MET`.

- `baseline` — We have a baseline and target
- `observable` — We can observe a change but have no baseline
- `idea` — We have a benefit in mind but no measurement
- `unknown` — I am not sure

### ARC — Architecture and model choice (AWS: architecture)

**EX-ARC-01** — What kind of AI capability do you intend to use?  
Shown when: `AI_INTENT`; related dimension: `TEC`.

- `off_the_shelf` — An existing AI tool
- `integrated` — An AI feature connected to our systems
- `custom` — A custom model or application
- `none` — No solution chosen yet
- `unknown` — I am not sure

**EX-ARC-02** — For incorrect or uncertain AI results, what would happen?  
Shown when: `AI_INTENT`; related dimension: `GOV`.

- `human` — A person can check, reject and correct results
- `fallback` — There is a fallback but it is not tested
- `none` — No reliable fallback exists
- `unknown` — I am not sure

### STO — Storage and information handling (AWS: storage)

**EX-STO-01** — Where is information for the proposed AI activity stored?  
Shown when: `ALL`; related dimension: `DAT`.

- `managed` — A managed system with access controls
- `mixed` — Across spreadsheets, devices and shared systems
- `paper` — Mainly paper or messages
- `unknown` — I am not sure

**EX-STO-02** — Can your organisation correct or remove information when needed?  
Shown when: `ALL`; related dimension: `DAT`.

- `routine` — Yes, with a known owner and process
- `manual` — Sometimes, through a manual request
- `none` — Not reliably
- `unknown` — I am not sure

### CMP — Compliance and security (AWS: regulations and compliance)

**EX-CMP-01** — Would the intended AI activity involve personal, financial, health, employee or confidential information?  
Shown when: `ALL`; related dimension: `GOV`.

- `none` — Only public or synthetic information
- `personal` — Some personal or business-confidential information
- `high` — High-impact decisions or specially protected information
- `unknown` — I am not sure

**EX-CMP-02** — What prevents unapproved information from being entered into AI services?  
Shown when: `ALL`; related dimension: `GOV`.

- `controlled` — An approved-tool policy and practical access controls
- `guidance` — Informal guidance only
- `none` — No clear restriction
- `unknown` — I am not sure

### INT — Systems integration (AWS: integration)

**EX-INT-01** — How would an AI tool obtain the information it needs?  
Shown when: `AI_INTENT`; related dimension: `TEC`.

- `api` — Through an approved integration
- `upload` — Through controlled manual file exports
- `copy` — By copy/paste or unreviewed uploads
- `unknown` — I am not sure

**EX-INT-02** — Which application is the authoritative record for changes made by the workflow?  
Shown when: `ALL`; related dimension: `TEC`.

- `known` — A clearly named system of record
- `multiple` — Several conflicting systems
- `none` — No dependable record
- `unknown` — I am not sure

### TST — Testing and evaluation (AWS: testing)

**EX-TST-01** — How would you check whether an AI result is good enough?  
Shown when: `AI_INTENT`; related dimension: `MET`.

- `dataset` — A representative test set and pass/fail criteria
- `review` — A person would review examples
- `informal` — We would try it and see
- `none` — No evaluation approach
- `unknown` — I am not sure

**EX-TST-02** — How would you test unsafe, incorrect or unusual responses?  
Shown when: `AI_INTENT`; related dimension: `GOV`.

- `redteam` — Planned negative cases and failure handling
- `samples` — Some unusual examples
- `none` — We have no such tests
- `unknown` — I am not sure

### DEP — Deployment and operations (AWS: deployment and automation)

**EX-DEP-01** — If an AI feature failed, how could staff continue working?  
Shown when: `CURRENT_OR_PLANNED`; related dimension: `TEC`.

- `fallback` — Tested manual fallback or rollback
- `manual` — A possible manual workaround
- `none` — The work would stop
- `unknown` — I am not sure

**EX-DEP-02** — Who would monitor quality, usage, problems and ongoing cost?  
Shown when: `CURRENT_OR_PLANNED`; related dimension: `MET`.

- `owner` — A named owner reviews agreed measures
- `reactive` — Someone responds when issues arise
- `none` — No person or process
- `unknown` — I am not sure

### DTS — Data strategy (AWS: data strategy)

**EX-DTS-01** — How is the accuracy and completeness of important records checked?  
Shown when: `ALL`; related dimension: `DAT`.

- `routine` — Repeatable checks with accountable corrections
- `spot` — Occasional manual checks
- `none` — No checks
- `unknown` — I am not sure

**EX-DTS-02** — Who decides which business data may be reused for new purposes?  
Shown when: `ALL`; related dimension: `GOV`.

- `owner` — A known authorized decision maker
- `informal` — Decision is informal
- `none` — No explicit owner
- `unknown` — I am not sure

### 6.1 Deep-dive flag semantics

`docs/domain/technical_extension.json` defines `flag_generation` as **exact answer value → flag** mappings and `flag_to_existing_action_ids` as **exact flag → action ID** mappings. Flags are append-only findings with evidence IDs, not free-text instructions, and are deduplicated by flag name. Any flag without a prescribed action is a diagnostic finding pending consultant review; never fabricate a solution.

**Pilot gating:** Current formal gates are `URGENT-REGULATED`, `GOV-DATA`, `DATA-UNKNOWN`, `OWN-NONE`, and `BASELINE-MISSING`, as defined in `docs/domain/decision_predicates.json`. Budget availability is a cost-fit status, not a gate. Deep-dive red flags (e.g. no fallback, uncontrolled sharing, high impact) are **referred to human review** and can block an affirmative “pilot-ready” claim; they must not silently override the signed decision AST.

---

## 7. Scoring, coverage and maturity bands — formal contract

### 7.1 Deterministic algorithm

For each core dimension `d`, the weight `w_d` is an integer percentage. Each dimension has exactly two scored indicators with values 0, 1, 2, 3 or 4, or unknown. The sum of seven dimension weights is 100.

```ts
// Conceptual algorithm; normalized integers are the source of truth.
let lowerEighths = 0;
let upperEighths = 0;
let coverageUnits = 0; // out of 200
for (const q of CORE_14) {
  const w = weights[q.dimension];
  const score = scoreFromStableOptionId(answers[q.id]); // 0..4 | null
  lowerEighths += w * (score ?? 0);
  upperEighths += w * (score ?? 4);
  if (score !== null) coverageUnits += w;
}
const lower = lowerEighths / 8;
const upper = upperEighths / 8;
const coverage = coverageUnits / 2;
// Boundaries must use raw integers, not rounded display numbers.
```

**Maturity bands (provisional):** 0–under 25 Foundational; 25–under 50 Emerging; 50–under 75 Developing; 75–100 Established. Emit a single band only if both raw endpoints fall in the same band; otherwise present the interval with “readiness spans more than one band.” `UNK` extends the possible range without imputation; unknowns generate verification actions.

### 7.2 Worked example with unknowns

| Dimension | Core answers | Lower numerator contribution | Upper numerator contribution |
|---|---|---:|---:|
| Strategy (15) | 3, 3 | 90 | 90 |
| Processes (15) | 2, 1 | 45 | 45 |
| Data (15) | 1, unknown | 15 | 75 |
| Technology (15) | 2, 2 | 60 | 60 |
| People (15) | 1, 2 | 45 | 45 |
| Governance (15) | 2, 1 | 45 | 45 |
| Measurement (10) | 1, unknown | 10 | 50 |
| **Total** | | **310** | **410** |

`scoreInterval = [310/8, 410/8] = [38.75, 51.25]`; display **38–52 / 100** if display uses floor lower / ceil upper. Coverage = 175/200 = **87.5%**. Because the range crosses 50, the user must **not** receive a single definitive maturity band.

### 7.3 Score invariants

1. A score change cannot reduce maturity if only that answer increases; unknown-to-known changes narrow the uncertainty interval as specified.
2. Budget, sector, organization size and optional AWS technical annex cannot alter `lowerEighths`, `upperEighths` or `coverageUnits`.
3. Editing and reverting a question must reproduce bit-for-bit identical normalized output.
4. Inactive probes cannot influence scoring or gates; stale probe answers are inert.
5. No hard governance gate can be hidden by a high aggregate score.
6. Missing data never becomes a silently imputed average and does not prevent results from being shown.

The full engine and fixture contract remains in `docs/domain/rules.json`, `docs/domain/decision_predicates.json` and `docs/domain/golden_cases.json`.

---

## 8. Diagnostic decision engine and path selection

### 8.1 Order of operations (pure functional design)

`validate → normalize → active question set → core interval → dimension intervals → active probe/evidence flags → formal gates → primary path → secondary paths → eligible catalog actions → severity/dependency/goal/feasibility ranking → budget constraint check → report record`.

**No LLM** may choose a gate, mutate a score or invent a financial estimate. Explain every result using human-reviewed templates populated from typed data.

### 8.2 Binding critical gates

| Gate | Exact conceptual trigger | Business consequence |
|---|---|---|
| `URGENT-REGULATED` | High-impact AI decision **yes** and AI is operational, being piloted or planned | Specialist review first; no implied permission to pilot |
| `GOV-DATA` | Confirmed unsafe sharing of personal/restricted data OR planned restricted-data use with weak safeguards | Protect information first; do not encourage uncontrolled testing |
| `DATA-UNKNOWN` | Both DAT indicators unknown OR vital records absent | Verify what data exists before proposing integrations |
| `OWN-NONE` | No accountable authorization role | Ownership is a required preliminary action |
| `BASELINE-MISSING` | Measurable goal and weak measurement with no baseline | No financial value claims |

**Normative syntax:** the *machine-readable* predicate AST in `docs/domain/decision_predicates.json` overrides this human-readable summary. An agent must not implement threshold comparisons from prose if the AST differs. Report contradictions for human resolution.

An unavailable budget produces an **unverified cost-fit status**, not a formal gate. Budget may inform action feasibility and cost-fit labels, but never changes readiness scores, readiness bands, formal gates, or assessment confidence.

### 8.3 Seven actionable recommendation paths

- **P6: Specialist review**. Trigger: signed predicate `P-P6`. Initial suggested action IDs: `A20, A21`.

- **P2: Protect information first**. Trigger: signed predicate `P-P2`. Initial suggested action IDs: `A09, A07, A08`.

- **P0: Verify the unknowns**. Trigger: signed predicate `P-P0`. Initial suggested action IDs: `A00, A01, A02`.

- **P1: Strengthen operating foundations**. Trigger: signed predicate `P-P1`. Initial suggested action IDs: `A03, A04, A06`.

- **P4: Connect and streamline digital work**. Trigger: signed predicate `P-P4`. Initial suggested action IDs: `A14, A15, A16`.

- **P3: Build people capability**. Trigger: signed predicate `P-P3`. Initial suggested action IDs: `A11, A12, A13`.

- **P5: Prepare a measured low-risk pilot**. Trigger: signed predicate `P-P5`. Initial suggested action IDs: `A17, A18, A19`.

**Path precedence:** P6 specialist review, then P2 safeguard first, then P0 unknowns, followed by P1 operating foundations, P4 digital workflow connectivity, P3 skills and adoption, P5 measured low-risk pilot. Exactly one primary path, at most two secondary paths. List every hard gate even when a different path is primary.

**Action selection:** retain existing 24-action catalog (`A00`–`A23`) and the `35% severity + 25% dependency unlock + 20% goal alignment + 20% feasibility` proposed ranking contract. Filter or flag actions lacking prerequisites; select three actionable first steps with stable tie-breaking. Avoid recommending a pilot when a governance blocker is present. A high-impact case must be referred to an appropriate domain specialist rather than equated with an industry label.

**Advice hierarchy:** (1) stop/contain credible harms; (2) verify unknowns; (3) improve foundations; (4) run low-risk, measured, human-reviewed experiments only when the preconditions exist. A valid result can explicitly be **do not use AI yet**.

---

## 9. Budget-aware, capacity-aware recommendations

### 9.1 Inputs and semantics

- Separate `budget_ceiling` for *one-off external cash over the next 90 days* from `monthly_budget_ceiling` for recurring spending. Both accept nonnegative KES values (other currency display only with an explicit conversion disclaimer; no implicit FX lookup).
- `0` means **no external cash budget**, not “unknown.” `prefer_not_to_say` and missing values are distinct. Additional staff time remains a real cost.
- Qualitative budget bands may constrain cost classes (`C0` none, `C1` low, `C2` moderate, `C3` specialist) but **do not constitute an actual cash quote**.
- `staff_capacity` and `decision_authority` affect feasibility and next-step presentation. No available time means even a free tool may be impractical.

### 9.2 Cost-fit decision table

| Evidence | System behavior | Report wording |
|---|---|---|
| No external cash | Prefer eligible `C0` tasks | “No new vendor spend identified; staff time still required” |
| Numeric ceiling but no verified price | Select cost-class-qualified options without declaring monetary fit | “Actual cost requires a quote/validation” |
| Numeric ceiling and current, complete price bound | If known upper total ≤ ceiling, mark **within stated ceiling** | “Indicative and subject to confirmation, taxes and usage” |
| Unknown budget | Prioritize C0 discovery + ask about constraints | “Budget fit not assessed” |
| Specialist/safety mandatory | Safety recommendation outranks budget | “Specialist cost and scope must be established before work” |
| Recurring cost unspecified | No claim of long-term affordability | “Operating cost requires further review” |

**Price evidence:** a monetary quote requires an explicit dated source, source currency, included/excluded components, one-off vs recurring horizon, taxes, review date and expiry. The V1 catalog does not ship verified prices; therefore V1 must normally communicate **effort and cost classes**, not specific KES investment, ROI or subscription savings.

### 9.3 Recommendation card contract

For every selected action show: `actionId`, concise title, why it matters now, source question/probe IDs, prerequisite, accountable owner role, effort class, cash cost class, **cost confidence**, suggested time window, and observable definition of done. At most three priority actions in the executive results; deeper action references may appear in the technical annex.

---

## 10. UX / interaction design system and exact screens

**Product experience:** calm, premium, accessible and persuasive without pressure. Silverspark navy `#0e1828`, charcoal, off-white and restrained silver; no stock-style dashboard overload. Typography: Helvetica Neue with robust available sans-serif fallback; Helvetica for titles. Use native controls and accessible semantics first, not bespoke inaccessible widgets. Content at 320px width must not overflow.

| Screen ID | Contents | Main action | Empty / failure behavior |
|---|---|---|---|
| `UX-00` Landing | Proposition, benefits, realistic completion estimate *after validation*, local privacy, sample result | Start | Still meaningful if JS is delayed via pre-rendered HTML |
| `UX-01` Profile | Org type, sector, desired business outcome | Continue | Inline field validation, no login prompt |
| `UX-02` Question | 1 question, 5 grounded options and unknown; help; progress; Previous | Next | Keyboard navigation; answers remain on Back |
| `UX-03` Preview | 5-answer insight preview, coverage warning | Continue assessment | No misleading full score |
| `UX-04` Evidence probe | Recent concrete example or check | Skip/answer | No duplicate anchors; no score penalty |
| `UX-05` Business context | Value stream, bottleneck, systems, measurement | Continue | All optional; no PII examples |
| `UX-06` Technical extension | Explanation of extra depth, module groups, skip rationale | Opt in | Default core-only report remains complete |
| `UX-07` Constraints | One-off budget, recurring budget, staff capacity, timeline | Review | `Prefer not to say`; no contact requirement |
| `UX-08` Review | Editable responses, data/unknown count, conflicts | See readiness | Editing invalidates cached evaluation and closes irrelevant probes |
| `UX-09` Results | Interval/band, seven bars, evidence coverage, blockers, top actions | View report | Full content visible on mobile; no charts-only dependency |
| `UX-10` Report | Executive report + optional technical annex | Print / copy | HTML is first-class; print is optional |
| `UX-11` Share | Preview non-sensitive text for WhatsApp, privacy notice | Open WhatsApp | No automatic send, fallback to copy |
| `UX-12` Local save | Clear storage behavior + delete choice | Save/clear | If storage blocked, continue in memory with warning |

### 10.1 Microinteractions and cognitive load

- Question screen presents a clear section label, progress indicator, Back button and keyboard operable selection.
- Never present a 30-question wall. Progressive reveal: three early profile fields → five preview questions → nine remaining core questions → optional evidence/extension → budget later.
- Adaptive help text: e.g. for a sole proprietor “If you run the business alone, you are the owner.” Avoid requiring a compliance department for a tiny business.
- On mobile, tappable targets satisfy WCAG 2.2 AA relevant criteria; animation is restrained and honors reduced-motion preferences.
- Draft saving after each completed response; make persistence behavior clear without frightening the user.
- The interface must explain that a report is **self-reported**, what “unknown” does to the range, and why a recommendation was made.
- Test print/share in Chrome/Edge, Safari, Firefox and at least one real Android; support degraded in-app browser flow with “Open in browser.”

### 10.2 Accessibility acceptance

Target [WCAG 2.2 AA](https://www.w3.org/WAI/standards-guidelines/wcag/): correct fieldset/legend semantics, headings, focus order and visible focus, announce dynamic progress and results, no color-only meaning, sufficient contrast, 200% zoom, error descriptions, no forced time limits, skip links, and printable nonchart alternatives.

---

## 11. Output contracts: client-facing and consultant-facing

### 11.1 Client report (always available without sharing)

1. Cover: Silverspark identity, assessment date, reference ID, draft methodological version.
2. Executive summary: why they assessed readiness, top strength, top gap, most prudent path.
3. Business snapshot: company segment, industry, primary goal, identified workflow/problem if provided.
4. Seven-dimension diagnostic: each maturity interval and evidence coverage, not just a composite index.
5. Overall score range: raw-methodology result, caution on unknowns and self-report.
6. Critical risks/gates: plain-language explanation and exact reported evidence (no false legal pronouncements).
7. Three recommended priority actions: rationale, owner, relative effort, cost class, prerequisites and done criteria.
8. Practical 30/60/90-day *suggested sequence*, not committed implementation plan.
9. Budget/capacity fit: explicitly unknown when no reviewed price source exists.
10. Optional technical annex: AWS-style findings, unverified answers, blockers and recommended verification.
11. Disclaimer: not a certification, suitability approval, audited assessment or financial guarantee.
12. Sharing and contact: voluntary, previewed, non-sensitive handoff.

### 11.2 Consultant-side review record (manual/outside static app)

| Required field | Consultant decision |
|---|---|
| Report reference and receipt channel | Record what was actually received |
| Client business goal and process | Confirm or revise with prospect |
| Data and system reality | Distinguish self-report, observed facts and unverified claims |
| Safety/sector requirements | Escalate high impact, privacy or authorization risks |
| Recommended primary path | Approve, reject or request more evidence |
| Budget and authority | Verify who can spend, how much and over what period |
| Silverspark offering | Select one or none; do not auto-upsell |
| Next contact action | Named owner, date and objective |

**Handoff reality:** The browser cannot make a trustworthy central consultant dashboard or receive responses without an additional service. The only reliable V1 intake is one explicitly shared by a person. Report files/JSON are not signed credentials and can be edited; recompute scores from signed method/version and actual answer option IDs when available.

### 11.3 Report contract and stability

`docs/domain/report_contract.json` defines required sections and action schemas. Generate an accessible semantic HTML report first, then print styling with `@page`, stable breaks and repeatable headers/footers. `window.print()` opens print UI; it does **not** return a PDF Blob. Do not claim direct Web Share file support without an actual generated file and compatible browser.

---

## 12. Data model, interfaces and architectural rules

### 12.1 Logical entities

```
Assessment (id, createdAt, schemaVersion, rubricVersion, reportVersion, source)
 ├── Profile (minimal answers, contextual discovery, optional constraints)
 ├── CoreAnswer[] (questionId, stableOptionId, answeredAt)
 ├── ProbeAnswer[] (probeId, choiceId, active)
 ├── TechnicalAnswer[] (questionId, stableChoiceId, appliesWhen)
 ├── Evaluation (coreScoreInterval, sevenDimensions, coverage, gates, paths)
 ├── Findings[] (type, severity, sourceQuestionIds, evidenceStatus)
 ├── Recommendations[] (catalogActionId, rationale, budgetStatus)
 └── Report (templateVersion, generatedAt, sections, disclaimer)
```

**No browser-accessible client secret** or business-record encryption key; no login, no API. The assessment stores no mandatory personal identity and is local to the browser unless the user deliberately shares it.

### 12.2 TypeScript contracts (illustrative compile-time design)

```ts
type MaturityOption = 0 | 1 | 2 | 3 | 4 | null;
type EvidenceLevel = 'self_reported' | 'clarified' | 'example_unverified';
type CostFit = 'no_cash_option' | 'within_verified_ceiling' |
  'possible_not_priced' | 'unknown' | 'specialist_review';

type AssessmentInput = {
  assessmentId: string;
  schemaVersion: string;
  questionBankVersion: string;
  profile: Record<string, unknown>; // parsed by strict Zod contract at runtime
  coreAnswers: Record<string, string>; // stable option IDs
  probeAnswers: Record<string, string>;
  extendedAnswers: Record<string, string>;
};

type ReadinessResult = {
  score: { lowerEighths: number; upperEighths: number; coverageUnits: number };
  dimensions: Record<string, {lower: number; upper: number; known: number}>;
  formalGates: Array<{id: string; triggeringIds: string[]; severity: string}>;
  flags: Array<{id: string; sourceQuestionIds: string[]; status: EvidenceLevel}>;
  primaryPath: string;
  secondaryPaths: string[];
  actionIds: string[];
  costFit: CostFit;
  ruleVersion: string;
};

function evaluate(input: AssessmentInput): ReadinessResult; // pure, no IO
function createReportModel(input: AssessmentInput, result: ReadinessResult): object;
```

Use Zod or equivalent to enforce schema at I/O boundaries. Unknown property names, invalid option IDs, oversized strings and polluted object prototypes must be rejected. UI can model state with a reducer; avoid an unnecessary global state or agent orchestration framework.

### 12.3 Modules and responsibilities

| Module | Owns | Forbidden responsibility |
|---|---|---|
| `domain/questions` | Versioned core, probes, extension and labels | Browser effects |
| `domain/evaluate` | Pure scoring, flags, paths, budget constraints | UI text or network requests |
| `domain/report` | Structured report view model | Re-scoring from untrusted embedded scores |
| `app/assessment` | Navigation, state reducer, local save | Hidden scoring changes |
| `ui` | Accessible screens, layout, print HTML | Business rule thresholds |
| `services/localDraft` | Session + opt-in IndexedDB storage | Remote submission |
| `services/handoff` | Previewed copy/WhatsApp outbound action | Claim that delivery occurred |

### 12.4 Hosting and deployment topology

```
GitHub repository (static source + signed rule JSON)
  └─ protected branch + GitHub Actions
       ├─ install pinned dependencies
       ├─ validate schemas, link IDs and fixtures
       ├─ typecheck / lint / unit tests / property tests
       ├─ browser E2E + accessibility checks
       ├─ build Vite static bundle + assets
       └─ upload-pages-artifact → deploy-pages
             └─ https://<owner>.github.io/silverspark-compass/
                    Browser: profile + scoring + reports + local storage
                    Voluntary external handoff: WhatsApp only on user click
```

GitHub Pages serves static files, not backend API endpoints; source code, weights and rule tables are inspectable by visitors. Vite `base` must equal `/silverspark-compass/` for the project-site URL; use hash-based routing or self-contained in-page navigation so reloads work. Pin actions to commit SHAs before production, and give deployment job `pages: write` and `id-token: write` with a protected `github-pages` environment. Official references: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Pages usage policy](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

### 12.5 Security and privacy for an exclusively static site

- Do not embed keys or secrets, collect credentials, or direct prospective clients to paste confidential business documents into prompts.
- Store session draft in `sessionStorage` with documented caveats; opt-in long save in IndexedDB; delete/export choices and a 30-day policy as in v1.2.
- Prevent unsafe HTML insertion; no `dangerouslySetInnerHTML` with response content. Strict controls on user-provided text, export and imported data.
- GitHub Pages does not expose an application-controlled server to set arbitrary security response headers. A meta CSP may help restrict scripts but cannot provide every response-header directive (e.g., `frame-ancestors` and HSTS); document the residual risk rather than assert those headers were configured. Prefer no third-party script dependencies.
- Handoff message text must not place raw answers, optional free text, contact details or sensitive classifications into a URL query string. Use summary codes only after preview.
- Public source rules are not a secret or intellectual property security boundary; only client evidence and calibrated learning can become a genuine proprietary advantage.
- Applicable Kenyan data-protection obligations, privacy notices, cross-border platform request logs and operator practices require a separate documented legal review; this static design alone does not settle them.

---

## 13. Engineering quality and test contract

### 13.1 Mandatory automated checks

- **Domain schema tests:** 14 core questions, each with 0–4 and unknown; seven dimensions total 100%; 18 deep questions have unique IDs; no flag refers to a missing existing catalog action; all branch values and user journeys valid.
- **Golden fixtures:** compare full decision trace, path, gates, score interval, unknown verification and top actions to human-authored expected results. Never let the same agent silently generate both behavioral assumptions and truth labels.
- **Property-based tests:** monotonicity of known maturity, budget/sector independence of score, permutation invariance, edit-revert idempotence, inactive-probe inertness, range never outside 0–100.
- **Branch coverage:** sole proprietor; fragmented SME; pilot-stage enterprise; high-impact workflow; all unknown; no cash; no available staff time; changed earlier answer; tab resume; unsupported in-app print.
- **UI E2E:** start → core → optional extension → results → print → copy/handoff. Confirm no requests containing answers or report data leave the browser unless explicitly initiated by user.
- **Accessibility:** automated axe plus manual keyboard screen reader spot-checks, reduced motion, zoom, contrast and content order.
- **Deployment:** `/silverspark-compass/` asset URLs, no blank app shell, GitHub Actions artifact from tested commit, smoke test live HTTPS URL and documented rollback.

### 13.2 Real-device UX and performance budgets

Test Chrome and Firefox desktop, mobile Safari, Chrome on an actual low-end Android, and at least one WhatsApp in-app browser. Targets: prerendered/usable landing shell, first-question critical script <= 160 KiB gzip, no unexpected layout shift, and lab LCP <= 2.5 seconds under defined device/network conditions. These are **targets**, not empirically measured claims. Lazy-load report/presentation code and avoid enormous client JS libraries.

### 13.3 Release blockers

Never release if: a formal gate produces a false safe-to-pilot instruction; scoring changes with the budget; unknown is treated as zero; decision output lacks evidence; an inactive probe still affects the result; the report exposes source notes/private records without permission; public Pages terms have not been resolved for intended commercial use; deployment checks fail; or privacy notice and contact destination have not been approved.

---

## 14. Agent-based implementation stages and formal handoffs

**Existing stage order is mandatory**: `S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8`. The expanded technical specification refines, rather than replaces, the v1.2 handoff system.

| Stage | Agent deliverables | Acceptance / handoff gate |
|---|---|---|
| **S0 — Concierge validation** | 10–15 consented pilot studies; time/unknown/comprehension logs; independent review of five cases; three anonymized sample reports | Product owner agrees which prompts and actions are credible, records failures |
| **S1 — Product & decision contract** | Approve 14 anchors, probes, 18 optional technical questions, field IDs, exact gates, catalog, example reports, golden expectations | Human signed rules; no ambiguous triggers or broken references; version manifest frozen |
| **S2 — Repository foundation** | Compilable React/Vite/TypeScript app; CI; base path; Zod schemas; Pages artifact workflow | All checks pass; static app opens at subpath with no backend assumptions |
| **S3 — Assessment and UX** | 3-field start, preview, 14 cores, adaptive probes, optional deep dive, context and budget, autosave, review | Keyboard/mobile test cases pass; user can finish without providing contact info |
| **S4 — Readiness decision engine** | Pure evaluator; hard gates; budget constraints; action ranking; trace; property tests | Human golden cases all match; budget never mutates score |
| **S5 — Report and commercial handoff** | Client results, executive and technical annex, print CSS, consented share preview, consultant review template | 100% report contract coverage; no automatic sends; privacy approved |
| **S6 — Independent QA** | E2E, security/a11y/performance and real-device findings; signed defect disposition | All critical issues resolved; independent reviewer documents sign-off |
| **S7 — GitHub Pages release** | Gated release run, live smoke checks, rollback rehearsal, operator handoff | Live site verified at project URL; terms policy approval present |
| **S8 — Calibration** | Usage from consented pilot/manual reviews, decision regression, versioned improvements | Revised method justified by evidence; no silent scoring changes |

**Stage handoff template (strict):** `stage ID`, `goal`, `entry dependencies`, `changed file paths`, `domain versions/hashes`, `implementation summary`, `tests run and exact results`, `screenshots/findings`, `security/privacy notes`, `known defects`, `human decisions required`, `reversal/rollback instructions`, `next stage inputs`, `reviewer name/date/status`. A green coding test is not a substitute for a human-approved rubric.

**Rules for Codex/Copilot:** one bounded stage per session/PR; read root AGENTS plus stage prompt; no rule inventing; implement machine-readable contracts verbatim; independent reviewing agent; report any conflict instead of resolving it silently; keep reproducible logs; do not refactor outside stage scope; call out policy/legal blockers before public launch.

---

## 15. Threat model, failure pre-mortem and commercial trade-offs

| Failure mode | What causes it | Prevention / reversal |
|---|---|---|
| Attractive but useless scores | Questions not calibrated against actual businesses | S0 manual testing; compare consultant judgments before building |
| All SMEs look “foundational” | Enterprise jargon and inadequate resolution at lower levels | Use real WhatsApp/M-Pesa/spreadsheet examples; calibrate option labels |
| False safe-to-pilot recommendation | Aggregate score masks a security/high-impact gate | Safety precedence; human review flag; golden dangerous cases |
| Customer abandons early | Too many fields and technical language | Three-field start; early preview; optional deep dive and budget later |
| Report fabricates affordability | Cost classes treated as real quotes | Strict cost evidence rules; unknown monetary fit disclosed |
| No usable sales pipeline | Static Pages cannot send background leads | User-reviewed handoff and manual CRM process; measure actual receipts |
| Work lost on mobile | Storage disabled, browser killed | Autosave plus opt-in durable save; graceful failure message |
| Implementation agents invent logic | Prose-only requirements and self-approved tests | Normative JSON contracts, independent fixtures and signed S1 |
| GitHub Pages terms breached | Primarily commercial prospect tool hosted on restricted free platform | Explicit launch policy decision; halt commercial use if not permitted |

### First-principles recommendation

Validate the questionnaire and recommendations *before* optimizing the interface. A readable 14-question diagnostic that leads to three defensible steps is superior to an elaborate agent experience producing fabricated ROI or irrelevant enterprise checklists. Make the advanced AWS-style module available when context warrants, not as a mandatory obstacle.

---

## 16. Documentation index and sources

### Normative files in developer kit

- `docs/domain/question_bank.json` — 14 scored core questions and weights (v1.1 baseline retained)
- `docs/domain/probes.json` — conditional evidence questions
- `docs/domain/profile_schema.json` — baseline profile, risk and budget information
- `docs/domain/decision_predicates.json` + `rules.json` — exact gates, scoring and path selection
- `docs/domain/action_catalog.json` — 24 initial actionable recommendations
- `docs/domain/golden_cases.json` — synthetic expected behavior, pending pilot sign-off
- `docs/domain/technical_extension.json` — **18 fully specified AWS-style technical questions**
- `docs/domain/prospective_client_discovery.json` — **13 additional optional discovery fields**
- `docs/domain/product_requirements.json` — **23 testable functional/nonfunctional requirements**
- `docs/domain/user_journeys.json` — **six client/consultant journeys**
- `docs/domain/report_contract.json` — **client report and consultant review content contract**
- `docs/domain/VERSION_MANIFEST.json` — versioning authority and sign-off status
- `docs/EXAMPLE_CLIENT_ASSESSMENTS.md` — four concrete consultant scenarios (illustrative, not signed fixtures)
- `scripts/validate_product_v13.py` — runnable structural-contract and scoring-property smoke test
- `docs/handoffs/HANDOFF_TEMPLATE.md` and `.github/prompts/S0…S8.prompt.md` — staged agent execution

### Official primary sources (reviewed 3 November 2026)

- Microsoft AI Readiness Assessment: https://learn.microsoft.com/en-us/assessments/94f1c697-9ba7-4d47-ad83-7c6bd94b1505/
- Microsoft AI adoption guidance: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/scenarios/ai/plan
- AWS generative AI workload assessment questionnaire: https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-workload-assessment/questionnaire.html
- AWS assessment guidance: https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-workload-assessment/best-practices.html
- AWS architecture, compliance, integration and testing sections linked above.
- W3C WCAG 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/
- OWASP ASVS v5: https://asvs.owasp.org/
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

**Document control:** V1.3 is a complete proposed *product specification* and agent handoff, not a shipped app, completed pilot, signed regulatory opinion, certified standard, measured user experience or approved commercial deployment. S0/S1 must validate the substance before S2–S7 produce code and publish it.
