# Compass delivery ledger

**3/23 verified, 20 remaining.** Production baseline PR #6, main `a30d622`, Pages run 44936811392. Branch codex at `f65d0bc` was merged. No open PR at reconciliation. Historical build percentages are distinct from this acceptance count.

| Rank | Original v3.0 | Requirement | Implementation and remaining evidence |
|---|---|---|---|
| 1 | 1, 2 | Consolidate and verify the assessment decision engine. | IN PROGRESS. PR #7 captured 18 pre-change outcomes and consolidated the evaluator. |
| 2 | 3, 7 | Implement separate readiness, safety, capacity and financial-evidence statuses. | VERIFIED. PR #8, `5b273da`, live run 44955816019. See evidence below. |
| 3 | 4 | Correct unsafe-data handling and unresolved safety evidence. | VERIFIED. PR #8, `5b273da`, live run 44955816019. See evidence below. |
| 4 | 5 | Make consequential AI-use detection precise. | IMPLEMENTED locally. Pending complete release and scenario verification. |
| 5 | 6 | Correct ownership and data-quality findings. | VERIFIED. PR #8, `5b273da`, live run 44955816019. See evidence below. |
| 6 | 7; Appendix A | Fix the perfect-score fallback and baseline interpretation. | VERIFIED. PR #8, `5b273da`, live run 44955816019. See evidence below. |
| 7 | 8 | Reconcile contradictory answers, diagnostics and recommendations. | IMPLEMENTED locally. Pending complete release and scenario verification. |
| 8 | 11, 13 | Improve question clarity and eliminate unnecessary repetition. | NOT STARTED |
| 9 | 12 | Explain the scoring method and uncertainty. | NOT STARTED |
| 10 | 14 | Personalise Compass by business size, industry and market. | NOT STARTED |
| 11 | 15 | Strengthen the existing AI-specific diagnostics. | NOT STARTED |
| 12 | 16 | Introduce deterministic business-opportunity discovery. | NOT STARTED |
| 13 | 17, 18 | Improve the existing three-action recommendation engine. | NOT STARTED |
| 14 | 19, 20 | Refine the required and optional assessment journeys. | NOT STARTED |
| 15 | 21 | Simplify the results and client-report content. | NOT STARTED |
| 16 | 22 | Finish and streamline the branded PDF. | NOT STARTED |
| 17 | 23 | Improve the voluntary sharing and consultation experience. | NOT STARTED |
| 18 | 9 | Strengthen saved-draft retention and privacy controls. | NOT STARTED |
| 19 | 25 | Improve landing-page information and discoverability. | NOT STARTED |
| 20 | 24, 26 | Complete accessibility, mobile and performance verification. | NOT STARTED |
| 21 | 27 | Finalise repository configuration and progress tracking. | NOT STARTED |
| 22 | 10 | Prepare and execute real-world methodological validation. | NOT STARTED |
| 23 | 28 | Resolve commercial hosting and analytics readiness. | NOT STARTED |

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
