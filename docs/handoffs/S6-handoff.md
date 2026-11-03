# S6 — Independent QA and hardening

**Stage status:** review_requested; not approved  
**Submitted by:** Copilot engineering assistant  
**Independent reviewer:** Separate code-review agent completed; findings incorporated below  
**Human approver:** Pending  
**Date:** 2026-11-03  
**Base commit:** `5cc7733bff49aebaa9f634f73f86d93a015f1f10` (`codex`; no S6 changes committed)  
**Input handoff:** `docs/handoffs/S5-handoff.md`, SHA-256 `B3E23F4EBC4BAC5DE59C60E2F1031C3C8AB7B596C776F08FAFEB9A156A4C130F`  
**Contract inputs:** manifest 1.3.5 (`DRAFT_UNAPPROVED`); product requirements 1.3.0; rules 1.2.0; question bank 1.1.0; extension 1.3.0; discovery 1.3.0; report 1.3.4; gates 1.2.0; action catalog 1.1.0.

## 1. Scope and changed files

S6 checked the implemented assessment/report flow against all 23 product requirements, recorded defects and verification limits, added a regression test for the static no-submission boundary, and corrected the UI-to-evaluator business-goal field mapping. No scoring, question, gate, recommendation, or report contract semantics were changed.

| File | Change |
|---|---|
| `src/App.tsx` | Maps the selected UI `businessGoal` to the evaluator's existing `primary_goal` field. SHA-256: `82D34F39F7DFC26E1963E6B92D515FC564D5E651FEFDA29EB8CB0F7185202177`. |
| `tests/s3-assessment.test.mjs` | Guards the UI-to-evaluator profile mapping. SHA-256: `45047A556CA989154A3F48EAB06D2ADA682AEA51A8376F85DDE0A83FFE650739`. |
| `tests/s4-engine.test.ts` | Verifies that a mapped efficiency goal activates the existing missing-baseline gate when its other conditions apply. SHA-256: `94754CDD604FCA1BDAA54E5A8094E0E5683CBD08093FEB11FECA77C0D0077E85`. |
| `tests/s6-quality.test.mjs` | Added a source-wide guard against browser request APIs, and checks for explicit local-save disclosure and user-triggered WhatsApp handoff. SHA-256: `5A3892C4A0B4EC79939197A2E227B67B4CE0F585F5520A3F49BB6FDD89CA5400`. |
| `docs/handoffs/S6-handoff.md` | This QA evidence, 23-requirement coverage matrix, defect log, and handoff. |
| `docs/handoffs/ledger.json` | Records S6 as review_requested; no approver is recorded. |
| `docs/stages/INDEX.md` | Updates the current stage evidence to reflect S5 approval and S6 review. |
| `docs/handoffs/S4-handoff.md`, `docs/handoffs/S5-handoff.md` | Removed trailing whitespace from approval metadata so `git diff --check` can validate the handoff changes. No meaning changed. |

## 2. Verification evidence

| Command or check | Result | Evidence / limitation |
|---|---|---|
| `npm run verify` | Passed | Contract checks, lint/typecheck, all 26 Node tests, production build, and static asset checks passed after the field-mapping correction. The build is served from `/silverspark-compass/`; entry JavaScript is 67.18 KiB gzip against the existing 90 KiB budget. |
| `npm audit` | Passed | Zero reported vulnerabilities. |
| `npm audit --omit=dev` | Passed | Zero reported vulnerabilities in production dependencies. |
| `node --test --experimental-strip-types tests/s6-quality.test.mjs` | Passed as part of `npm run verify` | Confirms current `src/**/*.ts(x)` contains no `fetch`, `XMLHttpRequest`, `sendBeacon`, or WebSocket submission path; local-save disclosure remains present; WhatsApp opening is user-triggered. This is a regression guard, not a network monitor. |
| Business-goal mapping regression | Passed in final `npm run verify` | `tests/s3-assessment.test.mjs` guards the app mapping and `tests/s4-engine.test.ts` exercises the existing baseline gate for the mapped goal. |
| Browser privacy/network check | Passed | Assessment/report flow used six same-origin static GET requests; no external request or assessment POST was observed. WhatsApp is only opened after the user activates its control. |
| Browser flow and report at 320px | Passed for checked flow | Completed the 14 core questions with unknown answers and inspected the expanded report. No horizontal overflow was observed; the full professional-services assessment ID wrapped rather than truncating. This does not substitute for real Android/iOS device testing. |
| Keyboard check | Passed for checked flow | Skip link is first; launching the assessment moves focus to the assessment heading. |
| `git diff --check` | Passed after all edits | The ledger and stage index produce line-ending normalization warnings on Windows; no whitespace errors were reported. |
| `python scripts/validate_kit.py` | Not run | Python is unavailable in the local environment. The restored S4 handoff now exists, but the prior CI run failed before deployment and no new GitHub Actions run has been triggered. |
| `python scripts/validate_product_v13.py` | Not run | Python is unavailable locally; the prior CI run stopped at the earlier validator. |
| Axe, screen-reader audit, real Android/iOS, native print/PDF, low-end-device performance, multi-tab and crash/resume tests | Not run | Required evidence remains open; no pass is claimed. |

No push or deployment was made. Local verification does not establish that the GitHub Pages workflow is green.

## 3. Product requirement coverage

“Verified” means direct automated or browser evidence is recorded above or in the cited test. “Partial” means some implementation/evidence exists but an acceptance condition remains unverified. “Gap” means the scoped implementation or required evidence is absent. The requirements remain contract inputs; this table does not change their authority.

| ID | Coverage | Evidence and remaining work |
|---|---|---|
| FR-001 | Verified | `tests/s3-assessment.test.mjs` checks the three-field start and contract-backed options. |
| FR-002 | Partial | Five-question preview exists and is covered by `tests/s3-assessment.test.mjs`; no dedicated assertion verifies its provisional/no-definitive-band behavior across all branches. |
| FR-003 | Verified | Contract check and `tests/s4-engine.test.ts` protect the 14 core indicators; exact list/order still depends on the draft manifest and independent S1 review. |
| FR-004 | Gap | Evaluator references probe IDs, but no conditional evidence-probe capture/edit-inertness flow or corresponding test was found in the app. |
| FR-005 | Gap | No optional 18-question technical diagnostic, condition/skip explanation, or deep-question score-isolation test was found in the app. |
| FR-006 | Gap | Value-stream and operational-pain fields are absent from the app. |
| FR-007 | Gap | Separate one-off/recurring budget ceilings and staff-capacity capture are absent from the app. |
| FR-008 | Partial | Interval, unknown-answer, and budget-independence tests exist in `tests/s4-engine.test.ts`; independent golden-case review remains pending. |
| FR-009 | Partial / high-risk | Safety-gate and precedence tests exist; independent review found high-impact/data context needed by some gates is not collected by the UI. The false-safe risk remains unresolved pending explicit product scope and independent golden-case review. |
| FR-010 | Partial | Path-aware guidance is implemented and tested; the full max-three-action and stable-output acceptance set has not been independently audited. |
| FR-011 | Verified for checked report contract | `tests/s5-report.test.ts` asserts mandatory report sections, and the 320px browser check verified wrapping. Axe and screen-reader review remain open under NFR-002. |
| FR-012 | Partial / decision conflict | Browser print/save action exists and is tested, but native PDF output was not generated. Copy summary is intentionally absent under the approved S5 UX, while this MUST requirement still requires it. Resolve the contract discrepancy before changing behavior. |
| FR-013 | Partial | WhatsApp handoff is click-triggered and not auto-sent. The implementation opens the prefilled external handoff directly; a separate in-page exact-payload review before leaving was not verified. |
| FR-014 | Gap | The “Consultant Review Template” only contains assessment ID, receipt method, verification status, reviewer, and approval state; it lacks the required evidence, acceptance, next-action, and follow-up fields. |
| FR-015 | Partial | Disclosed `sessionStorage` draft exists. No opt-in longer-term save, multi-tab conflict behavior, or crash/resume test was verified. |
| FR-016 | Verified for checked flow | Source regression test and browser network check found no assessment submission; only same-origin static GETs were observed. |
| NFR-001 | Partial / S7 | Subpath asset validation and browser use at `/silverspark-compass/` passed; refresh/hash-route end-to-end coverage remains for release testing. |
| NFR-002 | Partial | Keyboard/focus and narrow-width checks passed. Axe, screen-reader, and target-device tests remain unrun, so WCAG 2.2 AA is not established. |
| NFR-003 | Partial | Landing shell, report code-splitting, and current gzip budget passed. Low-end Android and lab performance review remain unrun. |
| NFR-004 | Partial | Version consistency and deterministic evaluator tests pass; golden expected results remain proposed and independently unreviewed. |
| NFR-005 | Not verified / S7 | Deployment is manually gated; required protected-branch and post-restoration Actions evidence is not available. |
| NFR-006 | Partial | Dependency audits report zero vulnerabilities and the source request guard passes. A dedicated secret/artifact scan and deployed CSP verification were not run. |
| NFR-007 | Partial | The S6 handoff and artifact test hash are recorded; independent reviewer/human sign-off and full release evidence are pending. |

## 4. Prioritized defect and risk log

The independent S6 code review found a high-severity false-safe risk (not an exploit): with only the UI-collected profile and high core answers, the evaluator can produce a high score with no safety gates because the UI does not collect the high-impact, AI-use, or data-context fields required by those predicates. The report can then say “No safety checks triggered.” The Product Owner chose to fix only the separate business-goal mapping and document this false-safe risk as a blocker. This review is not a security certification.

| Priority | Finding | Confidence | Required disposition |
|---|---|---:|---|
| HIGH / P1 | Safety context required for `URGENT-REGULATED` and `GOV-DATA` is unreachable from the UI; a high score can be shown with no triggered safety checks. | 9/10 | Remains an S6 blocker. Resolve whether to collect the existing context fields or withhold safety conclusions; do not imply absence of a gate means low risk. |
| RESOLVED | UI supplied `businessGoal`, while `BASELINE-MISSING` reads `primary_goal`; the selected goal failed to reach this existing predicate. S6 now maps the field and adds UI/domain regression tests. | 9/10 | Final `npm run verify` passes; mapping only, no predicate or threshold change. |
| P1 | FR-004 through FR-007 are not present in the assessment flow: conditional evidence probes, optional technical diagnostic, business discovery, and budget/staff-capacity capture. | 9/10 | Product/engineering scope decision and implementation with independent tests before claiming these MUSTs complete. |
| P1 | FR-015 is only partially implemented: session-tab draft exists, but opt-in longer save and multi-tab/crash-resume behavior are not evidenced. | 9/10 | Resolve storage scope and test persistence/conflict/privacy behavior. |
| P1 | FR-014 consultant template is incomplete; required evidence, acceptance, next action, and follow-up fields are missing. | 9/10 | Complete and test the offline/manual review protocol. |
| P1 | FR-012 conflicts with approved S5 behavior: the product requirement says copy summary is MUST, while S5 explicitly removed the control. | 10/10 | Product Owner/S1 contract resolution; do not silently reintroduce or waive the requirement. |
| P2 | FR-013 acceptance requires review of the exact payload before opening the external messaging app; only the click-triggered prefilled handoff was verified. | 8/10 | Verify UX with product owner and test the exact payload review behavior. |
| P2 | NFR-002/NFR-003 acceptance is incomplete without axe, screen-reader, real-device and low-end performance evidence. | 10/10 | Complete accessibility/device QA before S6 approval. |
| P1 release blocker | Python validators and the Pages workflow have not been rerun after restoring the S4 handoff; no push is authorized or claimed. | 10/10 | Run both validators and inspect the Actions quality job after an authorized push; do not bypass the validator. |

## 5. Acceptance checklist and unresolved risks

- [x] Local contract, lint/type, test, build, and asset gates pass.
- [x] A source-level no-submission regression test is present.
- [x] The UI business-goal field is mapped to the evaluator contract and regression coverage is added.
- [x] Narrow-width report wrapping and checked keyboard flow have evidence.
- [ ] All 23 product requirements meet their acceptance criteria; gaps and partial coverage are listed above.
- [ ] Resolve the independently identified high-severity false-safe risk; axe, screen-reader, and golden-case review also remain open.
- [ ] GitHub Actions quality workflow passes after the S4 handoff restoration.
- [x] Separate code-review agent completed review and its findings were incorporated.
- [ ] Human Product Owner approves S6.

Risks: the manifest remains `DRAFT_UNAPPROVED`; golden fixtures and real-world calibration remain pending; public Pages use is blocked pending commercial-terms review; local verification does not prove CI or deployment status. S7 is not authorized by this handoff.

## 6. Rollback, outputs, and next-stage blockers

- **Rollback:** revert only the `src/App.tsx` profile mapping and its two regression tests, `tests/s6-quality.test.mjs`, this S6 handoff, the S6 ledger/index status edits, and the whitespace-only cleanup if rejected. Preserve the existing S4/S5 product changes and approvals.
- **Outputs:** S6 QA report and prioritized defect log in this file; regression test `tests/s6-quality.test.mjs`; no application bundle or domain contract version change.
- **Next-stage blockers:** explicit human S6 approval; resolution of the high-severity false-safe risk and P1 product gaps/contract conflict; successful post-restoration GitHub Actions validators; commercial-use policy decision before any public release.
- **Documentation privacy:** Product Owner chose to retain required tracked docs. No broad `docs/` ignore rule was added; no separate private/local documentation paths were specified.
- **Status:** submitted for separate review only. The implementing agent does not approve S6 or authorize S7.
