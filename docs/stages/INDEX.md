# Staged execution index — Silverspark Compass v1.2

**Protocol:** strict order S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8; a human-signed handoff unlocks the next stage. No stage is currently approved.

| Stage | Contract | Main output |
|---|---|---|
| S0 | [Concierge validation](S0-validation.md) | Study protocol, consent model, anonymized measurement log, reviewer rubric, decision changes |
| S1 | [Freeze decision contracts](S1-domain-contracts.md) | Signed contract catalog, data/semantic version record, fixture diff, contract audit |
| S2 | [Repository, GitHub Pages and CI foundation](S2-pages-foundation.md) | Compilable app skeleton, commands and CI workflow, /silverspark-compass/ browser/asset check |
| S3 | [Guided assessment and storage](S3-assessment-ux.md) | Working browser flow, real-device screenshots or findings, Playwright wizard tests |
| S4 | [Deterministic readiness evaluator](S4-engine.md) | Unit/property test evidence, fixture expected-versus-actual diff, decision trace |
| S5 | [Report and voluntary handoff](S5-report-share.md) | Accessible results/print flows, exact outbound payload examples, report-version evidence |
| S6 | [Independent QA and hardening](S6-quality-hardening.md) | QA report and prioritized defect log, release blockers resolved or documented |
| S7 | [GitHub Pages release](S7-pages-release.md) | Live URL and SHA evidence, workflow run proof, release log, rollback instructions |
| S8 | [Continuous calibration and maintenance](S8-calibration.md) | Release retrospective, revised backlog, versioned ADRs and fixture updates for future stages |

## Acceptance invariant
A preceding stage must have human approval and its referenced artifacts must exist before a downstream agent edits its scope. Final release additionally requires a GitHub Pages commercial-use terms decision.

## Agent delegation
Use `.github/prompts/SN.prompt.md` for a fresh session. Keep the stage implementation and reviewer separate. Human product owner is final signatory.

## Current evidence
S0 real-world validation remains incomplete and unapproved (0 actual participants and 0 independent reviews per the explicitly synthetic summary). Under the Architect's documented development-only override, S1 contract inventory and structural audit are `review_requested`; no contract is frozen or human-approved. S2 is `blocked` pending human S1 decisions/review. S3–S8 remain `not_started`. Synthetic cases are not validated customer cases.
