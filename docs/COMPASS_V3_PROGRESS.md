# Compass delivery ledger

**5/23 verified, 18 remaining.** Production baseline PR #6, main `a30d622`, Pages run 44936811392. Branch codex at `f65d0bc` was merged. No open PR at reconciliation. Historical build percentages are distinct from this acceptance count.

| Rank | Original v3.0 | Requirement | Implementation and remaining evidence |
|---|---|---|---|
| 1 | 1, 2 | Consolidate and verify the assessment decision engine. | IN PROGRESS. Engine, numeric and narrative fixtures released. Extended checks continue. |
| 2 | 3, 7 | Implement separate readiness, safety, capacity and financial-evidence statuses. | VERIFIED. Independent statuses. PR #8, `5b273da`, live run 44955816019. |
| 3 | 4 | Correct unsafe-data handling and unresolved safety evidence. | VERIFIED. Active, skipped and confirmed disclosure and restricted plans. PR #8, `5b273da`. |
| 4 | 5 | Make consequential AI-use detection precise. | IMPLEMENTED. Consequential roles and human authority question released. Extended tests pending. |
| 5 | 6 | Correct ownership and data-quality findings. | IN PROGRESS. Explicit sole ownership and poor data findings shipped. Single unknown reliability correction in progress. |
| 6 | 7; Appendix A | Fix the perfect-score fallback and baseline interpretation. | VERIFIED. Exact 77, 81 and 100 cases and financial-only baseline checks. PR #8. |
| 7 | 8 | Reconcile contradictory answers, diagnostics and recommendations. | IN PROGRESS. Evidence-linked contradictions and clarifying actions released. Extended tests pending. |
| 8 | 11, 13 | Improve question clarity and eliminate unnecessary repetition. | IMPLEMENTED. All 14 ladders revised in bank 2.0.0, with draft migration. PR #9. |
| 9 | 12 | Explain the scoring method and uncertainty. | IMPLEMENTED. MethodNote and check hints in PR #9. Verify independently against scoring contracts. |
| 10 | 14 | Personalise Compass by business size, industry and market. | IMPLEMENTED. Persona and market examples and authoritative industry options in PR #9. |
| 11 | 15 | Strengthen the existing AI-specific diagnostics. | IN PROGRESS. Guided novice and current-use diagnostics awaiting CI. |
| 12 | 16 | Introduce deterministic business-opportunity discovery. | VERIFIED. Opportunity tests exercise foundation, process, automation and AI branches. PR #9. |
| 13 | 17, 18 | Improve the existing three-action recommendation engine. | IN PROGRESS. Catalog ranking retained. Action-specific steps and outcomes awaiting CI. |
| 14 | 19, 20 | Refine the required and optional assessment journeys. | VERIFIED. PR #9. Live Chrome traversed all safety screens, edit, skip, optional details and results. |
| 15 | 21 | Simplify the results and client-report content. | IMPLEMENTED. Executive guidance and action plan refocused, 0% strengths excluded in PR #9. |
| 16 | 22 | Finish and streamline the branded PDF. | IMPLEMENTED. PR #9 verifies PDF extraction, reference and filename. Visual review of rendered pages pending. |
| 17 | 23 | Improve the voluntary sharing and consultation experience. | IN PROGRESS. Exact voluntary outbound message tested live. Direct telephone route pending release. |
| 18 | 9 | Strengthen saved-draft retention and privacy controls. | IMPLEMENTED. Session and device migration/expiry and draft tests released. Multi-tab browser evidence pending. |
| 19 | 25 | Improve landing-page information and discoverability. | IN PROGRESS. Landing asset and metadata update in preparation. |
| 20 | 24, 26 | Complete accessibility, mobile and performance verification. | IN PROGRESS. Automated Chrome and print/PDF checks are distinct from physical-device and assistive-technology validation. |
| 21 | 27 | Finalise repository configuration and progress tracking. | IN PROGRESS. Base path corrected. Artifact dependency audit and final release evidence pending. |
| 22 | 10 | Prepare and execute real-world methodological validation. | EXTERNAL VALIDATION PENDING. Existing pilot materials retained, updated protocol prepared. No participants assessed. |
| 23 | 28 | Resolve commercial hosting and analytics readiness. | IN PROGRESS. Hosting review, migration option and analytics design prepared. No commercial launch approval. |

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
