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

Users choose a business goal, answer one question at a time, and get a quick read on which of the first five answers need confirmation. The second part proceeds from data and systems to people, safeguards and measurement. Review lets users revisit one answer directly, then return to five required safety-context questions. From there, users can go straight to their results or add context one optional section at a time. 

The snapshot leads from the score or range to a labeled readiness signal, safety checks and a practical next step. The first action comes from the existing recommendation catalog. The report retains the areas of readiness, unknowns and supporting actions, with self-reported status and optional sharing. The product has no live customer benchmarking data.

## Site audit

| Surface | Checks applied |
| --- | --- |
| Landing | Language and title, main landmark, keyboard skip link, clear call to action, narrow layout, no-JavaScript explanation and assessment loading on demand. |
| Profile and questions | Visible labels associated with native controls, radio groups with legends, programmatic heading focus on transitions, labeled progress, explicit text guidance, readable font sizes and large answer targets. |
| Review | Correct names for safety fields, answer edits, safety fields required before results, optional wizard navigation, aligned tool checkboxes and responsive field pairs. |
| Results and report | Text labels for readiness colors, foreground and background contrast on key panels, 320px layout and 200% results text checks, prioritized action, appendix disclosure, direct PDF download and exact WhatsApp summary preview. |
| Static delivery | Relative base for project Pages, lazy assessment and report chunks, system fonts, no external requests during the tested journey, SHA-pinned deployment and live checks. |

The audit applies [Chrome’s form guidance](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/forms/forms.md), [Chrome’s accessibility guidance](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/guides/accessibility/accessibility/guide.md), [Chrome’s HTML guidance](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/html/html.md) and [WCAG 2.2 text resize guidance](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). The evidence consists of source inspection and the checks in `tests/browser-smoke.cjs`. Broader assistive-technology testing, formal accessibility certification and validation with prospective clients require separate evidence.

## Journey review · 23 November 2026

| Observed friction | Change | Regression evidence |
| --- | --- | --- |
| The five-question checkpoint understated the remaining work. | Show the remaining readiness and safety question counts. | Counts come from the same question collections as the wizard. |
| Device draft controls repeated beneath every screen. | Retain same-tab refresh recovery. Offer resume or deletion only for an existing device copy on an empty profile. | Browser tests complete the wizard, revisit Results, open an independent tab, and exercise legacy resume and deletion. |
| Report actions followed the chart and caveats. Preview was the primary action. | Place Export Report first alongside Send Report and Preview Report, after the first recommended action. Explain PDF export and voluntary sharing at the point of choice. | The browser suite checks order, PDF download and fallback, separate preview, exact message and explicit WhatsApp confirmation. |
| Generic opportunities and repeated uncertainty notes competed with the first action. | Display specific opportunities after the toolbar. Keep detailed measurement below the chart and show uncertainty guidance for incomplete evidence. | The existing evaluator supplies the known-answer count for the summary and chart. |

The review covers the web journey and its test fixtures. Field observation with business owners and physical-device screen-reader testing are still pending.

## End-to-end audit · 23 November 2026

Examined the Pages release at `aff9f78`, the wizard and evaluator, and all three report outputs. The published three-page PDF fixture places the decision and dimension breakdown on page one, priority actions on page two, and supporting evidence on page three.

| Area | Finding and disposition | Verification |
| --- | --- | --- |
| Landing and delivery | A failed lazy-loaded assessment could leave an empty application. Assessment and report loading now have a visible recovery action. A failed report module leaves the decision summary on screen. | Chrome blocks the assessment module, checks the recovery notice, restores the network, and re-enters the wizard. |
| Profile, questions and safety | Review lacked a shortcut to correct the business profile. Editing a single safety answer reopened all five questions. Back from a core edit also retained unsaved selections. All three edit paths now keep changes separate until saved and return directly to Review. | Browser checks cover cancel and save, focus, edited responses, and the chosen goal in the exported journey. |
| Refresh recovery | A refresh previously returned an in-progress assessment to Profile. The tab now remembers its question or optional step. Restoring a checkpoint validates earlier required answers. Unsaved review edits resume at Review with the committed answers. | The regression suite checks invalid, incomplete and out-of-range checkpoints. Chrome reopens an interrupted question. |
| Optional details | The workflow, capacity, conditional evidence and optional technical screens retain separate skip and continue actions. The technical screen can contain a long list in full mode. | Existing mobile, desktop and keyboard checks cover navigation, field pairs and tool selections. Observe full-mode abandonment in the consented pilot before changing its length. |
| Results, preview and PDF | The preview painted the upper bound as confirmed readiness. Each channel now uses the same seven rows and rounding rules. Solid fill ends at the lower bound. HTML uses stripes for uncertainty and PDF uses a silver extension. PDF chart generation reads evaluated dimensions directly. | Unit cases cover 0%, fully unknown, partial and exact fractional results. Chrome compares the seven bounds across Results and preview. The PDF gate extracts text and renders actual pages. |
| WhatsApp and privacy | The exact outbound summary stays visible before confirmation. Report export, independent preview and legacy-copy recovery remain available. | Browser checks compare the outbound message to its preview, verify its destination and exercise PDF download and fallback. |

### Remaining priorities

1. Observe first-time business owners explaining their result, choosing the first action, and exporting or sharing on a physical phone. Complete the physical Android screen-reader and in-app PDF checks. The automated journey cannot establish comprehension or commercial conversion.

## Report architecture follow-up

The preview and PDF now take their recommendations, decisions, assessment answers and provenance from the same typed report content. The exporter draws the document directly from those values. A browser regression records the visible preview’s synthetic content and compares it with text extracted from the downloaded PDF, including both evidence columns.
