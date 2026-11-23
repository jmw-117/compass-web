# Compass delivery ledger

**21/23 verified, 2 remaining (91.3%).** The latest verified application release is `8b6de63` (PR #15). Item 20 requires manual accessibility and device testing. Item 22 requires real-business and independent expert validation.

| Rank | Original v3.0 | Requirement | Implementation and remaining evidence |
|---|---|---|---|
| 1 | 1, 2 | Consolidate and verify the assessment decision engine. | VERIFIED. Versioned rules, pre-change numeric and narrative fixtures, and scenario regressions. PRs #7, #8 and #10. |
| 2 | 3, 7 | Implement separate readiness, safety, capacity and financial-evidence statuses. | VERIFIED. Independent statuses. PR #8, `5b273da`, live run 44955816019. |
| 3 | 4 | Correct unsafe-data handling and unresolved safety evidence. | VERIFIED. Active, skipped and confirmed disclosure and restricted plans. PR #8, `5b273da`. |
| 4 | 5 | Make consequential AI-use detection precise. | VERIFIED. Decision, influence and assistive roles plus reviewer authority and contradiction scenarios. PRs #8 and #10. |
| 5 | 6 | Correct ownership and data-quality findings. | VERIFIED. Sole-owner confirmation, untested quality and confirmed poor records. PRs #8 and #10. |
| 6 | 7; Appendix A | Fix the perfect-score fallback and baseline interpretation. | VERIFIED. Exact 77, 81 and 100 cases and financial-only baseline checks. PR #8. |
| 7 | 8 | Reconcile contradictory answers, diagnostics and recommendations. | VERIFIED. Governance/disclosure, measurement/baseline, fallback and goal conflicts surface alongside the original score. PRs #8 and #10. |
| 8 | 11, 13 | Improve question clarity and eliminate unnecessary repetition. | VERIFIED. Fourteen observable ladders, versioned question bank and safe migration. PR #9. Real comprehension study remains in item 22. |
| 9 | 12 | Explain the scoring method and uncertainty. | VERIFIED. MethodNote reads dimension weights and band starts from the scoring contracts and explains provisional thresholds, unknowns and checks. PR #9. |
| 10 | 14 | Personalise Compass by business size, industry and market. | VERIFIED. Four audience profiles, shared industry options and Kenya examples. Four-persona score neutrality regression in PR #10. |
| 11 | 15 | Strengthen the existing AI-specific diagnostics. | VERIFIED. Guided first-use and current-use diagnostics, full annex and unscored vendor and continuity evidence. PR #10. |
| 12 | 16 | Introduce deterministic business-opportunity discovery. | VERIFIED. Opportunity tests exercise foundation, process, automation and AI branches. PR #9. |
| 13 | 17, 18 | Improve the existing three-action recommendation engine. | VERIFIED. Industry, goal, workflow and bottleneck inform the first action. Action-specific steps, owners, affordability, dependencies and completion evidence use the existing catalogue. Direct regression and branded export in PR #12. |
| 14 | 19, 20 | Refine the required and optional assessment journeys. | VERIFIED. PR #9. Live Chrome traversed all safety screens, edit, skip, optional details and results. |
| 15 | 21 | Simplify the results and client-report content. | VERIFIED. Results and report lead with guidance and a first action. A dedicated regression checks that zero-score dimensions cannot appear as strengths and a genuine strength can appear. PR #12. |
| 16 | 22 | Finish and streamline the branded PDF. | VERIFIED. The synthetic report fits three visually inspected pages with branded header, readiness graphic and AI guidance, actions and evidence. Extracted text, page count, filename and metadata pass. PR #12. |
| 17 | 23 | Improve the voluntary sharing and consultation experience. | VERIFIED. Exact summary preview, user-controlled outbound message, copy and alternative telephone contact. PRs #8 and #10. |
| 18 | 9 | Strengthen saved-draft retention and privacy controls. | VERIFIED. Versioning, migration and expiry remain in force. Owner revision in PR #17 removes ordinary device-save controls. The browser suite covers tab recovery, independent tabs and explicit recovery or deletion of earlier device copies. |
| 19 | 25 | Improve landing-page information and discoverability. | VERIFIED. Landing information, brand identity, canonical link, favicon and social card shipped. The owner removed the fictional sample from the landing-page scope after PR #14. |
| 20 | 24, 26 | Complete accessibility, mobile and performance verification. | PARTIAL. Chrome responsive widths, keyboard focus, accessibility tree, 200% results text, PDF and bundle budget passed. Physical Android, assistive technology and in-app download fallback evidence outstanding. |
| 21 | 27 | Finalise repository configuration and progress tracking. | VERIFIED. Corrected Pages base, removed obsolete artifacts after reference checks, verified protected build and rollback documentation. PRs #9–#11. This ledger cites the live release. |
| 22 | 10 | Prepare and execute real-world methodological validation. | EXTERNAL VALIDATION PENDING. Existing pilot materials retained, updated protocol prepared. No participants assessed. |
| 23 | 28 | Resolve commercial hosting and analytics readiness. | VERIFIED FOR APPROVED SCOPE. Existing test deployment, hosting terms review, branded-domain migration route and design-only counters documented. Commercial and privacy approvals are pending. |

Real-user validation, independent expert review, legal/privacy review and commercial hosting approval remain pending. GitHub Pages remains a test deployment.

## Release evidence

PR #7 merged as `200c982` after the quality job passed for `f347058`. Pages run 44954952782 passed deployment and the live checks. The self-contained replacement specification governs this ledger.

## Decision corrections

| Scenario | Previous output | Revised output |
|---|---|---|
| 100, no capacity supplied | Verify The Unknowns | All core answers known. Confirm available time. |
| 77 or 81, no capacity | Generic missing evidence | Name capacity explicitly. Numeric score retained. |
| High Governance, admitted unsafe disclosure | Active probe could be discarded | Hold, independently of numerical readiness. |
| Skipped active disclosure probe | Gate absent with no uncertainty state | Review required. No confirmed disclosure. |
| Real restricted data proposed without protections | No independent proposed-use question | Hold for the proposed use, without asserting an incident. |
| Baseline probe skipped | Could be marked missing | Financial evidence unverified. |
| Sole proprietor with informal ownership | STR-02 could block despite personal responsibility | Accept explicit owner confirmation. |

Numeric regressions and guidance assertions are in tests/decision-integrity.test.ts. Original synthetic golden expectations remain intact. Full replacement-specification verification is in progress.

## Verified release checkpoints

PR #8 passed the protected quality job at `00c0bd3`, merged as `5b273da` and passed the full Pages and live Chrome run 44955816019. Files include the decision contracts, evaluate.ts, DecisionSummary.tsx, ReportModule.tsx, export-pdf.ts and tests/decision-integrity.test.ts. Forty tests passed. Live Chrome verified the export, new-tab preview and exact consented message. The next batch adds extracted-PDF decision checks.

- Item 2. Four outputs rendered from the same evaluated response. 1/23 verified, 22 remaining.
- Item 3. Confirmed, unresolved and inactive evidence have distinct regression cases. 2/23 verified, 21 remaining.
- Item 6. Exact 77, 81 and 100 scores, and an unanswered baseline, covered by numeric and narrative checks. 3/23 verified, 20 remaining.

## Further verified release checkpoints

PR #9 merged as `8466f99`. Main run 44957016996 passed quality, Pages and live Chrome. The default base is /compass-web/. The browser exported a real PDF. Poppler extracted its Hold guidance and Silverspark contact and rendered its pages.

- Item 12. tests/opportunity.test.ts and src/domain/opportunity.ts. 4/23 verified, 19 remaining.
- Item 14. src/App.tsx and tests/browser-smoke.cjs. 5/23 verified, 18 remaining.

## Release verification for PR #10

Branch quality run 44957446179 passed the scenario suite, production build, extended contracts, browser and PDF tests. Visual inspection of its five rendered PDF pages found a sparse final appendix page and repeated safety wording. The next release compacts the dimension chart and groups evidence and actions. Physical-device, screen-reader, independent research and commercial approvals remain open.

## Reconciliation after PRs #10 and #11

PR #10 merged at `b201da9`. [Run 45000846232](https://github.com/jmw-117/compass-web/actions/runs/45000846232) passed protected quality and deployed-browser checks. PR #11 merged at `a61113f`. [Run 45001185249](https://github.com/jmw-117/compass-web/actions/runs/45001185249) passed all 47 unit/contract tests, extended Python contract validation, production build, browser/PDF smoke, exported text checks, rendering and live assessment verification. The five PDF pages were visually reviewed. The surviving gaps are recorded against their items.

| Newly reconciled item | Verified | Remaining |
|---|---:|---:|
| 1 | 6/23 | 17 |
| 4 | 7/23 | 16 |
| 5 | 8/23 | 15 |
| 7 | 9/23 | 14 |
| 8 | 10/23 | 13 |
| 9 | 11/23 | 12 |
| 10 | 12/23 | 11 |
| 11 | 13/23 | 10 |
| 17 | 14/23 | 9 |
| 18 | 15/23 | 8 |
| 19 | 16/23 | 7 |
| 21 | 17/23 | 6 |
| 23 | 18/23 | 5 |

Real-business participation and independent review are pending. Legal/privacy and commercial hosting approvals remain separate. Analytics are off.

## Live release of the client report

[PR #12](https://github.com/jmw-117/compass-web/pull/12) merged at `c54c75a` after the required quality check at `398059a`. [Main release checks](https://github.com/jmw-117/compass-web/actions/runs/45001766849) cover the protected build, deployment and live assessment. The suite passed 49 tests and the extended contract job checked 1,500 reference-score samples. The entry bundle measured 67.41 KiB gzipped against a 90 KiB limit.

- Item 13. The action-context scenario uses a trades business with a service goal and lost leads. 19/23 verified, 4 remaining.
- Item 15. All-zero and mixed positive/zero scenarios verify the strength selection. 20/23 verified, 3 remaining.
- Item 16. The exported synthetic report contains three inspected pages. A page-count regression catches a stranded methodology note. 21/23 verified, 2 remaining.

A separate in-app browser connection timed out before navigation could be verified. Item 20 remains open for physical Android, screen-reader operation and in-app download handling. Item 22 remains External Validation Pending. The pilot materials are ready and no participants have been assessed. The live GitHub Pages deployment is for testing. Commercial hosting and privacy clearance remain external; analytics are disabled.

## Pilot usability follow-up

The Results celebration uses a brief two-sided burst, respects reduced motion and leaves the controls accessible. The five progress labels share one row. The chart distinguishes known scores from uncertainty. The profile and safety screens use one introduction and question-specific, market-neutral examples. Exact KES budgets are optional. Browser regression coverage includes blocked automatic PDF downloads and the local Open PDF recovery link. These engineering changes add evidence to item 20. Physical Android, assistive-technology and embedded-browser testing are still open. The participant study and independent review in item 22 remain outstanding. **21/23 verified, 2 remaining.**

The [PR #14 application release](https://github.com/jmw-117/compass-web/pull/14) passed [main and live Pages checks](https://github.com/jmw-117/compass-web/actions/runs/45045561137) at `848fa19`. The subsequent landing-page change removes the fictional sample. Personal report preview, export and sharing remain available after completing an assessment.

The profile offers eight business outcomes with a suggested measure for each. Previous goal IDs continue to restore. The goal selects relevant action guidance and leaves the 14-question readiness instrument unchanged. A fictional professional-services journey was also completed in the live ChatGPT in-app browser through Results and PDF generation. That browser's automation policy blocked opening the generated PDF, so embedded viewing remains unverified. **21/23 verified, 2 remaining.**

[PR #15](https://github.com/jmw-117/compass-web/pull/15) merged as `8b6de63`. [Release verification](https://github.com/jmw-117/compass-web/actions/runs/45139213271) passed all 50 tests, 1,500 reference scoring samples and the deployed browser journey. The browser checked the eight rendered goals against the profile contract, selected “Get paid sooner,” verified its measure in the report preview, restored the selection from a draft and checked that the landing sample was absent. **21/23 verified, 2 remaining.**

## Results flow revision · 23 November 2026

21/23 backlog items verified, 2 remaining. [PR #17](https://github.com/jmw-117/compass-web/pull/17) tracks implementation, merge and release checks for the revised flow. Original backlog coverage is unchanged. Physical-device assistive technology checks and independent field validation remain open.

[PR #17](https://github.com/jmw-117/compass-web/pull/17) deployed as `aff9f78`. [Live release verification](https://github.com/jmw-117/compass-web/actions/runs/45158738747) passed.

### Whole-application audit

[PR #18](https://github.com/jmw-117/compass-web/pull/18) follows up on items 14–18 and 20. It adds direct review corrections, shared dimension presentation, tab checkpoints and loading recovery. The [audit](ASSESSMENT_UX_AUDIT.md) lists coverage and outstanding priorities. **21/23 verified, 2 remaining.**
