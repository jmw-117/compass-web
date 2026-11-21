# Compass questionnaire benchmark and site audit

Reviewed on 21 November 2026 against question bank 1.1.0 and the current static GitHub Pages application.

## Questionnaire benchmark

The 14 scored anchors examine capabilities a small organisation can describe and verify. The wizard uses the versioned prompts and answer choices directly. Examples clarify what to consider without selecting an answer or changing the evaluator. These references support the topic coverage. The Compass scale and thresholds come from its product contracts.

| Anchors | Capability examined | Benchmark |
| --- | --- | --- |
| STR-01, STR-02 | Define a business outcome and identify the person who approves changes. | Microsoft CAF AI strategy and NIST Govern |
| PRO-01, PRO-02 | Understand existing work and identify delays, repeat work and errors before changing it. | AWS CAF process transformation and NIST Map |
| DAT-01, DAT-02 | Check the reliability of records and responsibility for maintaining them. | Microsoft CAF AI readiness and NIST Map and Measure |
| TEC-01, TEC-02 | Understand where records live and how the organisation combines them. | AWS CAF technology and process transformation |
| PEO-01, PEO-02 | Check team ability to use and verify AI and support a change in how people work. | NIST Govern and Microsoft CAF AI adoption |
| GOV-01, GOV-02 | Check protections for sensitive information and human review of important decisions. | NIST Govern and Manage |
| MET-01, MET-02 | Establish a measure of improvement and check the outcome after a change. | Microsoft CAF AI strategy and NIST Measure and Manage |

References

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [Microsoft Cloud Adoption Framework for AI](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai/strategy)
- [AWS Cloud Adoption Framework business outcomes and transformation](https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/accelerating-business-outcomes.html)

## Flow and interpretation

Users choose a business goal, answer one question at a time, and get a quick read on which of the first five answers need confirmation. The second part proceeds from data and systems to people, safeguards and measurement. Review lets users revisit one answer directly, then return to five required safety-context questions and optional diagnostics. 

The snapshot leads from the score or range to a labeled readiness signal, safety checks and a practical next step. The first action comes from the existing recommendation catalog. The report retains the areas of readiness, unknowns and supporting actions, with self-reported status and optional sharing. The product has no live customer benchmarking data.

## Site audit

| Surface | Checks applied |
| --- | --- |
| Landing | Language and title, main landmark, keyboard skip link, clear call to action, narrow layout, no-JavaScript explanation and assessment loading on demand. |
| Profile and questions | Visible labels associated with native controls, radio groups with legends, programmatic heading focus on transitions, labeled progress, explicit text guidance, readable font sizes and large answer targets. |
| Review | Correct names for safety fields, visible accordion labels, answer edits, safety fields required before results, diagnostics disclosed as optional. |
| Results and report | Text labels for readiness colors, foreground and background contrast on key panels, 320px layout and 200% results text checks, prioritized action, browser PDF and optional WhatsApp preview. |
| Static delivery | Relative base for project Pages, lazy assessment and report chunks, system fonts, no external requests during the tested journey, SHA-pinned deployment and live checks. |

The audit applies [Chrome’s form guidance](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/forms/forms.md), [Chrome’s accessibility guidance](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/guides/accessibility/accessibility/guide.md), [Chrome’s HTML guidance](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/html/html.md) and [WCAG 2.2 text resize guidance](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). The evidence consists of source inspection and the checks in `tests/browser-smoke.cjs`. Broader assistive-technology testing, formal accessibility certification and validation with prospective clients require separate evidence.
