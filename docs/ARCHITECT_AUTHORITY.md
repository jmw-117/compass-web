# Architect Authority and Flexible Stage Handoffs — Policy v1.4

**Policy owner:** Silverspark Product Owner / Solution Architect  
**Scope:** Stages S0–S8 in the Compass development workflow.  
**Status:** Proposed for explicit adoption by the human product owner.

## Operating principle
The stages are planning and traceability devices, not a delegated veto over the Architect. An agent must never invent pilot findings, human approvals or passed tests, but it may proceed with **development** based on the owner's documented direction while non-critical research or documentation is pending.

## Decision modes
1. **Normal / autonomous development:** Agents can complete a bounded stage and start the next development stage when required technical checks pass, the handoff exists and no material unaccepted risk is introduced. Human countersignature is **not required between every stage**. Record factual stage completion, not an invented reviewer endorsement.
2. **Architect override:** The human product owner may explicitly authorize a stage to start or continue despite a *process, research, formatting, evidence-completeness or sequencing* gap. The agent records (a) the instruction and source, (b) reason, (c) scope, (d) known consequences, (e) deferred checks and target review. Report previous work as `complete_with_exceptions` / `overridden_for_development` and never as fully validated.
3. **Human hold:** The Architect may pause or reorder any stage, split it into slices, or send it backward for revision. Agents must obey an express hold.
4. **External release gate:** Public launch requires verified functionality, deployment compatibility, privacy/security review, relevant legal/hosting policy decision and documented outstanding risks. A development-only override is **not** a release approval. Never falsify a CI result or claim statutory compliance.

## Fast handoff record
Each stage summary should have no more than one page where possible:
- Stage ID, state, last commit (if known) and files changed.
- Scope delivered and what remains incomplete.
- Commands and exact outcomes (passed/failed/not_run).
- Evidence classification: `real_observed`, `synthetic_fixture`, `automated_test`, `human_reviewed`, or `not_assessed`.
- Key risks and contractual changes.
- `gate_decision`: `auto_continue`, `architect_override`, `hold`, `release_ready`, `release_blocked`.
- For `architect_override`: owner authority reference, waived process conditions, reason, permitted next stage, deferred work.

Do not demand a duplicate approval in every agent session. A standing instruction or owner-signed decision in the repository remains valid within its stated scope until revoked, materially changed, or expired.

## S0 => S1 exception
The 12 synthetic scenarios are test inputs, **not** a completed real S0 pilot. Under the owner’s express development-only override, S1 can proceed using the simulation while real-client validation stays outstanding. S1 should still verify product-contract cross-references and document ambiguities before S2.

## Non-waivable factual boundaries
- No fictitious participant consent, interviews, independent review, user analytics or success statistics represented as real.
- No invented passing tests, builds, deployment links or official standards accreditation.
- No removal of actual privacy, security or hosting-law obligations by changing a document status.
- No automatic disclosure of identifiable client data or secrets.
- Do not weaken a product safeguard based solely on synthetic evidence; escalate and obtain the Architect's risk acceptance.

## Change management
An agent may propose changes. The Architect has final authority over scope, cost and sequence. Changes to scoring/risk-gate semantics require a recorded version bump, fixture comparison and an identified approver or explicit Architect override. Preserve factual traceability even when process is streamlined.
