# S1 Contract Review — Approved for progression with exceptions

**Status:** S1 approved by the Product Owner / Architect for progression to S2 on 2026-11-03; research and independent-validation exceptions remain
**Prepared:** 2026-11-03
**Branch:** `codex`
**Purpose:** Record the contract inventory, structural cross-reference audit, Architect-directed budget decision, and accepted exceptions. This does not claim empirical calibration or public-release readiness.

## 1. Authority and evidence boundary

The Architect's instruction in this Copilot conversation to proceed to S1 is recorded as a **scope-limited development override** under `docs/ARCHITECT_AUTHORITY.md` v1.4. The owner subsequently approved S1 for S2 progression in Copilot chat on 2026-11-03. This does not mark the real-world S0 pilot complete, establish empirical validity, or approve public release. The specific budget non-gating decision is recorded in `docs/adr/ADR-004-budget-non-gating.md`; independent golden-case review and real-world calibration remain outstanding, and the domain manifest remains `DRAFT_UNAPPROVED`.

`docs/S0_SYNTHETIC_PILOT_SUMMARY.md` is explicitly `SYNTHETIC_DEVELOPMENT_FIXTURE`, `NOT_CONDUCTED`, and `NOT_REAL_WORLD_VALIDATED`: 0 real participants, 0 independent consultant reviews, and 0 actual technical reviewers. Its numeric values are invented simulation outputs and are not validation results. No real-world success, comprehension, score-discrimination, or false-safe rate is claimed.

## 2. Contract inventory

| Contract | Version | Audit observation |
|---|---:|---|
| `VERSION_MANIFEST.json` | 1.3.1 | `DRAFT_UNAPPROVED`; calls for S0 evidence and S1 independent review |
| `question_bank.json` | 1.1.0 | 14 universal scored indicators across seven dimensions |
| `probes.json` | 1.1.0 | Seven conditional, explicitly non-scoring probes; cap 7 |
| `rules.json` | 1.2.0 | Interval scoring, provisional bands, five gates, seven-path precedence, action ranking and budget rules |
| `decision_predicates.json` | 1.2.0 | Machine-readable five-gate/seven-path AST; marked proposed |
| `action_catalog.json` | 1.1.0 | 24 provisional actions A00–A23 |
| `golden_cases.json` | 1.2.0 | 13 proposed synthetic cases; includes budget non-effect invariants from Architect decision; file explicitly requires human review and says expected outputs are not validated execution results |
| `profile_schema.json` | 1.1.0 | Three early fields and later safety, AI-use, budget, capacity and source fields |
| `prospective_client_discovery.json` | 1.3.0 | 13 optional business-discovery fields; says budget affects recommendations only |
| `technical_extension.json` | 1.3.0 | 18 questions in nine AWS-inspired modules; diagnostic-only |
| `report_contract.json` | 1.3.0 | 15 mandatory report sections; self-reported watermark and user-controlled handoff |
| `product_requirements.json` | 1.3.0 | 23 requirements across S0 and S3–S7 |
| `user_journeys.json` | 1.3.0 | Six draft journeys |

The canonical specification is `docs/PRODUCT_TECHNICAL_SPECIFICATION.md`. The user-added `docs/Silverspark_Compass_V1_3_Product_Technical_Specification.md` was byte-identical to the canonical file at S1 input. Both copies were kept aligned for the Architect-directed wording/version update; the manifest points to `docs/PRODUCT_TECHNICAL_SPECIFICATION.md` as canonical.

### Input fingerprints (SHA-256)

| Input | SHA-256 |
|---|---|
| `docs/ARCHITECT_AUTHORITY.md` | `f3e31ca28cf6cf744b9feb2fa58660ceab41c4e10a8c666dc859e0990e1e4f80` |
| `docs/S0_SYNTHETIC_PILOT_SUMMARY.md` | `a720f0b5e9f2ab658fd8f930991926d640b3df50ac4bf3fa522876fb1294df9d` |
| `docs/PRODUCT_TECHNICAL_SPECIFICATION.md` | `d6d0f1070db55080d70bc31e4d1f54e7d2a5e853fa85a965b00f88ac1c92f537` |
| `docs/domain/VERSION_MANIFEST.json` | `506f983b3bfcd9943c8e862a873f7fadf2bf1eba5f3ed432086ed319ce12e01f` |
| `docs/domain/question_bank.json` | `e88b54e8174163029d61ed65826088463ec83e264b7840e236f523b41753f1d2` |
| `docs/domain/probes.json` | `1e2e6a015da75eca470f0c465069da4b11ca045b24225fcbe9e904c9e8ac2d07` |
| `docs/domain/rules.json` | `ee6c5c6fb8e2cfafec94007c4e97ae0564f56743ac3423b653801643be0aeea4` |
| `docs/domain/decision_predicates.json` | `a4493d4ca3ad01434409e68629572d24fec96041da801a8674907a081e07980b` |
| `docs/domain/action_catalog.json` | `5af29a6fdcacc6c9442c090eb10722c59e1dd9f260c8de2f25b6fd8d1b1bf429` |
| `docs/domain/golden_cases.json` | `90498ec211a5e23d36ca29bb5cdc7f1ce9b07732a0bd4e0e5114ce944b40f40b` |
| `docs/domain/profile_schema.json` | `9f17fc4819094b6646f9fd04da749418fec4b20f3630efcd1661009b7c3728e1` |
| `docs/domain/prospective_client_discovery.json` | `380a9da235b09b3becfe56400d0c58abced1cb76b2faac28e93fa9ae324f463c` |
| `docs/domain/technical_extension.json` | `a7b921e9aefd30b1b833c2fc3ba470f30178ca06c70d003bb1b4d75bd105c242` |
| `docs/domain/report_contract.json` | `99a078840fad7396c53fbbabebb1d0648eb055f442e21d21531017cb62ce3577` |
| `docs/domain/product_requirements.json` | `aa42fb1e85a3908b5bb132dcda5810973f2c5e602b5ea3a051b39805d53141af` |
| `docs/domain/user_journeys.json` | `af41cf9101a7842e1499ef81e60ce42f5a358a1ddab372398cf4f8a3bf55923a` |

The fingerprints below capture pre-decision inputs for traceability. The updated contract/output fingerprints that follow identify the current draft artifacts; neither set of hashes indicates approval.

### Updated contract/output fingerprints (SHA-256)

| Output | SHA-256 |
|---|---|
| `docs/domain/rules.json` | `cb5db1fcb64d84fd948f3ca9af64cb4faf0ff78c235f81594f399867c83069bb` |
| `docs/domain/decision_predicates.json` | `25e16a45e50f480a059773d30d53f2586773027cec0f7e4b882c5c3f20675246` |
| `docs/domain/VERSION_MANIFEST.json` | `a0e44a381c7ae33e53c65e73858451a77617a8709e866394934005ea775d94fe` |
| `docs/domain/golden_cases.json` | `884048cc82c6976ecd59ee6532d4dd46c9c63b38695fc8b8f091f8385a70d321` |
| `docs/PRODUCT_TECHNICAL_SPECIFICATION.md` | `403d8860dc64fd4bdd1d46504fc8fb12cf174ff5b9c74408ea74d66c0c3df4f0` |

The canonical specification and user-provided duplicate have matching SHA-256 values after the update. These fingerprints identify the proposed review outputs; they do not indicate approval.

## 3. Structural checks performed

Read-only checks found:

- 14 unique core question IDs; seven dimensions with two indicators each; weights sum to 100; every question has scores 0–4 plus unknown.
- Seven probe definitions, maximum seven; all are marked non-scoring.
- Five formal gate predicates and seven path predicates are present; rules reference existing predicate IDs. No budget field appears in a formal gate.
- 24 action IDs; prerequisite references are present and the prerequisite graph is acyclic; action evidence references resolve to a core question or probe.
- 18 unique technical questions across nine declared modules; all are `DIAGNOSTIC_ONLY`; module membership and conditions resolve.
- Technical flag/action references point to existing actions where mappings are declared. Six generated flags have no action mapping: `owner_unverified`, `baseline_unverified`, `human_review_unverified`, `data_location_unverified`, `data_classification_unknown`, and `ai_use_controls_unverified`. The product specification permits unmapped findings to remain diagnostic and pending consultant review; no action should be invented for them.
- 13 golden cases reference existing core question IDs. Structural validity does not establish independent authorship, correctness, or human approval.
- Product crosswalks cover the seven Microsoft-inspired pillars and nine AWS-inspired technical areas; these are mappings, not vendor endorsement or equivalence.

`npm run check:contracts` now performs the checks above across 12 JSON contracts, including the version manifest, and rejects budget references in formal gate predicates. The two Python validators remain unavailable in this environment. No scorer exists yet, so no expected-vs-actual evaluator comparison was run.

## 4. Architect decision applied; remaining review items

1. **Budget semantics — applied per Architect direction; recorded in ADR-004.** FR-007 is kept literal: budget fields do not change score, formal gates, or confidence. `BUDGET-UNKNOWN` / `G-BUDGET-UNKNOWN` were removed. Unknown budget is represented as unverified cost fit; budget may still affect action feasibility and cost-fit labels. Rules, predicate, gate-manifest and golden-case versions were bumped. F01 now declares budget non-effect invariants for score, gates, and confidence; these expectations derive from the Architect's instruction, not observed participant data.
2. **Golden expectations.** The 13 fixtures are explicitly proposed, not independently reviewed. Several expected-output fields differ by case and they do not evidence 13 independently authored human expectations. Human-authored expected results and an independent reviewer are still required before S4 implementation. Do not derive expected outputs from code or synthetic usability metrics.
3. **Provisional methodology.** Score bands and recommendations remain draft and uncalibrated. Synthetic cases may check structural/arithmetic behavior only; they cannot authorize external validity claims or weaken a safety control.
4. **Budget field semantics.** The profile contains a one-off 90-day ceiling and qualitative band; discovery adds a monthly recurring ceiling and budget window. Handling of missing, `unknown`, `prefer_not_to_say`, and zero, and how the two ceilings combine without implying an actual quote, still requires review.
5. **Unmapped technical flags.** Six unmapped flags remain diagnostic findings for consultant review with no automatic action, consistent with the product-specification rule.
6. **Report handoff destination.** Report requirements include a consultation CTA/WhatsApp handoff, but a verified destination is not recorded in these contracts. This remains a later release dependency; no destination should be guessed.
7. **Approval and version status.** The Architect approved S1 progression to S2. The domain manifest remains `DRAFT_UNAPPROVED` pending independent golden-case review and real-world validation; this status is not a claim that the S1 stage approval is pending.

## 5. S1 disposition

**Completed:** inventory, structural cross-reference checks, crosswalk check, Architect-directed budget-gate contract update, and owner approval for S2 progression.
**Exceptions:** independent golden-case approval, real-world validation, scorer implementation, and release approval remain incomplete.
**Next safe action:** Proceed with the bounded S2 foundation. Revisit unresolved budget-field and golden-case details before implementing the S3/S4 behaviors that depend on them; do not make an external-validity or release claim.
