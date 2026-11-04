# S0 Concierge Validation Package

**Status:** Proposed study materials; product-owner, privacy and consent review required
**Prepared:** 2026-11-03
**Stage:** S0 only
**Evidence status:** No participants recruited or interviewed; no outcomes or approvals are claimed

## 1. Purpose and boundaries

Use moderated concierge sessions to learn whether prospective clients understand the proposed instrument and find its eventual advice useful. This is research on a draft instrument, not a validated assessment, a score certification, legal advice, or a sales qualification exercise.

The immutable starting point is the existing 14-question bank (`question_bank.json` v1.1.0). Treat all v1.3 domain contracts as proposed until the required human reviews are complete. Do not change question IDs, option meanings, weights, gates, score rules, paths, or actions during S0. Record proposed changes for S1 review instead. The optional 18-question technical extension is diagnostic only and must not be presented as a score.

This package is a draft for review. Do not begin recruitment until the product owner approves the protocol and the appropriate privacy/consent reviewer approves the participant notice and data-handling plan.

## 2. Pilot protocol

### Participants and recruitment

- Recruit **10–15 real prospective-client participants**, with voluntary informed consent.
- Aim for a useful mix: approximately five sole proprietors/owner-operators, seven SMEs, and up to three more mature or regulated organisations where available. These are recruitment targets, not quotas or evidence that those groups have been represented.
- Include lower-maturity owner-operators and at least one experienced AI-workload stakeholder able to review the optional technical questions. One person may meet more than one profile.
- Obtain independent consultant review for at least five completed, consented cases. The reviewer must not be the implementer and must record uncertainty rather than fill gaps by assumption.
- Do not recruit people into a regulated/high-impact scenario solely to satisfy a quota. Do not imply that participation affects access to services.

### Session design

Plan for 45–60 minutes per participant, subject to pilot usability. Record actual durations; do not present this estimate as measured.

1. **Before the session:** assign a random participant code outside this repository; confirm consent; explain the unvalidated status and local-only pilot behavior. Do not request names, customer records, credentials, personal identifiers, or confidential business details.
2. **Core walkthrough:** ask the participant to complete the existing 14 questions using the pilot. Use think-aloud prompts only after the participant has first interpreted the question independently. Record start/end time, answer changes, requests for explanation, and skipped/unknown answers.
3. **Optional discovery comprehension:** review the 13 proposed discovery fields using the contract or a paper script. They are not present in the current pilot UI; do not claim that they were tested in the running application.
4. **Technical comprehension:** review relevant questions from the proposed 18-question diagnostic with participants for whom they make sense; include at least one experienced AI-workload stakeholder. Explain that this module is optional and diagnostic-only, not a second readiness score. It is not implemented in the current pilot UI.
5. **Usefulness discussion:** after a human has independently prepared a clearly labeled draft interpretation, ask the participant whether the proposed next steps are understandable and relevant. Do not claim the pilot app generated a score or recommendation; it does not.
6. **Independent review:** a consultant separately reviews at least five consented case summaries using Section 6 below. Challenge dangerous or apparently reassuring cases explicitly.
7. **Close:** offer a separate, optional marketing/contact consent choice. Declining contact must not affect research participation. Provide the approved withdrawal/contact instructions once the owner supplies them.

Do not use a third-party form or recording service unless its access, storage, retention, privacy notice, and consent implications have been reviewed and approved. Default to no audio/video recording. If notes or recording are proposed, obtain separate explicit consent and define access and deletion before use.

### Stop and escalation rules

- Stop the session if a participant begins sharing secrets, customer-identifying data, health/financial records, credentials, or other sensitive material. Do not copy it into notes or this repository.
- Stop and escalate any apparently unsafe or “safe to proceed” conclusion involving a consequential/high-impact workflow; no aggregate score or consultant opinion in this study is a deployment approval.
- Record technical failures separately from participant abandonment. Do not count facilitator or environment failures as participant failures.
- Do not publish, share, or retain identifiable quotes, screenshots, recordings, or raw answer sets without separate approval and consent.

## 3. Participant information and consent framework

This is a drafting aid, not legal advice or a claim of legal sufficiency. The product owner must fill in and approve the responsible organisation/contact, purpose, data controller and lawful handling basis, retention/deletion period, withdrawal route, and any privacy notice before recruitment.

### Plain-language invitation (draft)

> Silverspark is reviewing a draft AI-readiness questionnaire. We would like to observe how you understand the questions and whether a human-prepared set of possible next steps is useful. This is research, not a validated score, compliance review, or promise of services. Taking part is voluntary; you can skip a question or stop at any time without affecting any relationship with Silverspark. Please do not share names, customer information, passwords, confidential records, or other sensitive details. The current website pilot keeps answers in this browser session and does not send them to Silverspark. Any research notes will be handled under the approved privacy and retention plan. Participation and permission for later marketing contact are separate choices.

### Consent checklist (complete before each session)

Record only a random study code and the consent choices in the approved research record; do not record a participant name here.

| Consent item | Yes / No / Not applicable |
|---|---|
| Participant received and understood the purpose, unvalidated status, and voluntary nature | |
| Participant had an opportunity to ask questions and may stop or skip questions | |
| Participant agrees to take part in the moderated session | |
| Participant agrees to anonymized/pseudonymized session notes for this validation | |
| Participant separately agrees to an anonymized quotation (optional) | |
| Participant separately agrees to recording (default: No; only if approved) | |
| Participant separately agrees to future marketing contact (optional) | |
| Approved privacy notice, responsible contact, retention and withdrawal process were provided | |

If the participant does not agree to participation or the required notes, do not collect research data. Honor each optional choice independently. The final consent form and any legal/privacy determinations require human approval before use.

## 4. Structured participant worksheet

**Keep completed worksheets outside the repository** in the owner-approved, access-controlled research location. This blank template must never be filled with actual participant responses in Git.

### Session record

| Field | Entry |
|---|---|
| Random participant code | |
| Consent completed (yes/no) | |
| Broad participant segment (owner-operator / SME / mature or regulated / other / prefer not to say) | |
| AI-workload experience relevant to technical review (yes/no/unknown) | |
| Session date (approved record only) | |
| Facilitator code | |
| Start / end time; core duration | |
| Completed all 14 core questions (yes/no) | |
| Participant stopped / reason volunteered (no inference) | |
| Browser/device issue (if any) | |
| Any interruption or explanation given (describe by question ID only) | |

### Core completion and comprehension log

For each question, note whether answered/unknown/skipped, whether the participant paraphrased the prompt as intended, whether they asked for help, and any observed ambiguity. Do not store free-text business facts or identifying quotes here.

| ID | Answered / unknown / skipped | Paraphrase understood? | Help or reread? | Answer changed? | Neutral observation / issue code |
|---|---|---|---|---|---|
| STR-01 | | | | | |
| STR-02 | | | | | |
| PRO-01 | | | | | |
| PRO-02 | | | | | |
| DAT-01 | | | | | |
| DAT-02 | | | | | |
| TEC-01 | | | | | |
| TEC-02 | | | | | |
| PEO-01 | | | | | |
| PEO-02 | | | | | |
| GOV-01 | | | | | |
| GOV-02 | | | | | |
| MET-01 | | | | | |
| MET-02 | | | | | |

### Optional module review record

These are draft-contract comprehension reviews, not tests of runtime functionality in the current application.

| Area | IDs reviewed | Relevant to participant? | Understood without explanation? | Sensitive, burdensome, or unclear? | Note by ID only |
|---|---|---|---|---|---|
| Discovery fields | business_size; commercial_model; value_stream; workflow_frequency; workflow_bottleneck; workflow_systems; impact_measure; baseline_known; budget_window; monthly_budget_ceiling; decision_authority; preferred_next_step; optional_context | | | | |
| Technical diagnostic | EX-RDY-01/02; EX-USE-01/02; EX-ARC-01/02; EX-STO-01/02; EX-CMP-01/02; EX-INT-01/02; EX-TST-01/02; EX-DEP-01/02; EX-DTS-01/02 | | | | |

For optional free text, explicitly ask whether the participant understands not to enter names or confidential/personal information. For budget questions, ask whether the time period and currency are clear; do not infer affordability or a price.

### Post-session participant feedback

Use the same response scale for every participant; “not sure” and “not applicable” are valid.

| Prompt | Response |
|---|---|
| Overall, how easy was it to understand the questions? (1 very difficult – 5 very easy) | |
| How relevant were the questions to your work? (1 not relevant – 5 very relevant) | |
| Were any questions uncomfortable or too sensitive? (IDs only; optional) | |
| If a human-prepared next-step summary were offered, how useful would it be? (1 not useful – 5 very useful / not sure) | |
| Were the proposed next steps understandable? (1 not understandable – 5 very understandable / not shown) | |
| What one thing was unclear or missing? (optional; do not include identifying details) | |

## 5. Questionnaire comprehension review

Preserve the exact prompt and options in `docs/domain/question_bank.json`; the IDs below are anchors for observations, not proposed edits. Ask first: “In your own words, what is this asking?” Then: “What information did you use to choose?” If needed, ask: “Was any word or answer choice unclear?” Do not suggest the intended answer before recording the first interpretation.

| ID | Comprehension focus for moderator |
|---|---|
| STR-01 | Does “plans for using AI or automation” and the connection to a business goal make sense without implying AI is required? |
| STR-02 | Can an owner-operator identify who decides, without assuming a formal committee or job title? |
| PRO-01 | Can the participant identify one repeatable work process and distinguish consistency from process documentation? |
| PRO-02 | Can they distinguish noticing an issue from tracking, investigating, and verifying improvement? |
| DAT-01 | Do “reliable records” and “everyday business decisions” suggest concrete records rather than abstract data infrastructure? |
| DAT-02 | Is responsibility for keeping records current and accessible understandable for a small business? |
| TEC-01 | Can participants map paper, messages, files, and tools to where records are kept without treating digital-only as automatically better? |
| TEC-02 | Do the choices distinguish manual re-entry, exports/connections, and reliable checked exchange? |
| PEO-01 | Do “AI safely” and “checking its work” have understandable meanings, including for participants with no AI experience? |
| PEO-02 | Does “introduce a new way of working” cover informal change in a one-person or small team? |
| GOV-01 | Do participants understand the information categories and the idea of rules/safeguards without interpreting the question as a legal-compliance test? |
| GOV-02 | Do participants distinguish human review, escalation, and monitoring of AI-assisted decisions? |
| MET-01 | Can participants identify a measurable process improvement without being prompted to provide financial ROI? |
| MET-02 | Do participants distinguish follow-up after a change from measuring the original baseline? |

Record comprehension issue counts by ID and denominator (eligible sessions that saw the question). Report exact counts and sample size alongside percentages; do not generalize this small purposive sample to all clients. Record “needed explanation” using a consistent rule: moderator gives a meaning-related explanation before the participant can choose, not a neutral repeat of the prompt.

## 6. Usefulness measurement and independent consultant evaluation

### Proposed pilot measures

The engineering blueprint contains these **proposed hypotheses**, not observed benchmarks. Product owner and reviewer must ratify or revise them before sessions begin; retain the decision and date in the approved study record.

| Measure | Proposed threshold | Calculation / evidence |
|---|---:|---|
| Moderated completion | >= 70% | Participants completing the agreed core flow / eligible participants who started; exclude documented facilitator/environment failures and report them separately |
| Median time for 14 core questions | <= 12 minutes | Median elapsed time from first core question to completion; report n and range |
| Consultant discovery usefulness | >= 70% score 4 or 5 / 5 | Independent reviewer ratings using the rubric below; disclose number reviewed |
| Participant action usefulness | >= 70% positive | Participants rating a human-prepared candidate action summary as useful/actionable; state clearly if no summary was shown |
| Primary-path concentration | <= 60% in mixed SME pilot unless explained by case mix | Count reviewed primary paths; this cannot be measured from the current no-score pilot without separate human judgment |
| Comprehension | <= 15% need explanation per question | Explanation-needed participants / participants shown that question; provide counts and small-sample caveat |
| Critical false-safe recommendations | 0 | Independent challenge cases; any occurrence is a stop-and-review finding, not averaged away |
| Unprompted consultation requests | Track only | Record actual voluntary requests only if separately consented; do not equate clicks, interest ratings, or hypothetical intent with leads |

Do not calculate or claim readiness-score distributions from the current pilot UI: it collects answers but does not score. Any hand assessment must be separately labeled as a human draft interpretation and cannot be treated as an approved engine result.

### Independent consultant rubric

Review at least five cases independently of the facilitator/implementer. Use only consented, minimized summaries. Do not put raw client material in the repository.

Rate 1 (not at all) to 5 (strongly) or “not enough evidence”:

1. The summary reflects the participant’s stated goal and workflow.
2. The identified gaps/unknowns are supported by the answers provided.
3. The next steps are understandable and actionable for the participant’s size/capacity.
4. The sequence respects prerequisites and does not overstate budget fit.
5. The recommendations are useful for a responsible consultant conversation without forcing a sale.

Also record independently:

- Any high-impact, data, governance, or ownership concern that needs specialist/human review.
- Any statement that could be read as a false assurance, legal conclusion, verified fact, fixed price, ROI, or “safe to pilot” approval.
- Evidence IDs supporting the concern; disagreement and unresolved unknowns.
- Whether a critical false-safe issue is present: **yes / no / uncertain**. Any “yes” or “uncertain” pauses the affected recommendation for owner review.
- Reviewer’s suggested disposition: retain as draft / clarify / remove / request contract decision. Suggestions do not change contracts during S0.

The existing `docs/CONSULTANT_REVIEW_TEMPLATE.md` remains the detailed manual follow-up record. This rubric does not replace it.

## 7. Expected-result template for later golden cases

This blank template is for future human-authored, independently reviewed expectations. It is **not** a new fixture and must not be populated with invented outputs. Current `docs/domain/golden_cases.json` has 13 proposed cases; its own status says expected outcomes are not validated execution results. Preserve it until S1 review.

```text
Case ID / synthetic pattern:
Source: synthetic reproduction of consented pattern / human scenario (never participant identity)
Contract versions and input hashes:
Profile and stable answer IDs:
Unknowns / missing evidence:
Expected score interval and coverage (only after the human contract is approved):
Expected triggered gates and exact evidence IDs:
Expected primary path and rationale:
Expected secondary paths (if applicable):
Expected action IDs, order, prerequisites, and rationale:
Forbidden / unsafe outcomes:
Budget-independence check:
Technical diagnostic findings (diagnostic-only; no second score):
Author (human):
Independent reviewer:
Review date and decision:
Differences from existing synthetic fixture:
```

Human authors must write expected outcomes before implementation behavior is generated, and an independent reviewer must challenge safety cases. Never copy raw client answers, names, quotes, or distinctive business details into a fixture; use a privacy-reviewed synthetic reproduction and record provenance without identifying the participant.

## 8. Assumptions, unanswered questions, and proposed improvements

### Assumptions to validate

- The 14 core questions can be discussed in a moderated session without asking for sensitive evidence.
- The intended participants can answer from their role, or can use “I am not sure” without penalty.
- The discovery fields add enough workflow context to justify their extra burden.
- Technical questions are only useful to a subset of participants and remain diagnostic-only.
- Human-prepared action summaries can be rated without implying they came from the app or are approved recommendations.

### Decisions required before recruitment

- Who is the named study owner, privacy contact, and consent approver?
- What lawful handling basis, approved storage location, retention/deletion period, and withdrawal route apply to study notes?
- Are anonymized quotes or recordings needed at all? Default is no.
- Which proposed thresholds will be pre-registered, and who can approve a change?
- How will the 13 optional fields and 18 technical items be presented in a consistent paper/moderated script while they remain absent from the app?
- Who is the independent consultant reviewer, and how will conflicts of interest be disclosed?
- What is the approved version of the participant notice and any incentive policy?
- Who will review S0 findings and decide whether S1 may begin?

### Improvement candidates (not adopted)

- Use neutral, non-enterprise examples only as moderator aids; do not change wording during data collection.
- Capture comprehension problems by stable question/field ID and test proposed wording changes in a later, approved round.
- Keep core, optional discovery, and technical diagnostic completion times separate to identify burden.
- Separate “not relevant,” “unknown,” “prefer not to answer,” and “skip” observations; do not silently map one to another in contracts.
- Review results for lower-maturity owner-operators and experienced AI stakeholders separately before combining patterns.

## 9. S0 completion checklist

- [ ] Product owner approves the protocol, participant notice, handling plan, and proposed measurement thresholds.
- [ ] 10–15 actual consenting participants complete the approved study; no synthetic cases are counted as participants.
- [ ] At least one experienced AI-workload stakeholder reviews technical diagnostic comprehension.
- [ ] Lower-maturity owner-operators are represented where recruitment permits; limitations are reported.
- [ ] At least five cases receive independent consultant review, including explicit challenge for critical false-safe recommendations.
- [ ] Completion, timing, unknown, comprehension, participant usefulness, and consultant usefulness evidence is summarized with denominators and limitations.
- [ ] Human-authored expected results are independently reviewed before any evaluator implementation.
- [ ] Product owner records unresolved decisions and signs S0; absent a separate Architect override, S1 remains blocked until that signature is recorded in the ledger.

**No checklist item is marked complete by this draft.**
