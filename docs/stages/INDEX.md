# Staged execution index — Silverspark Compass v1.2

**Protocol:** stages normally proceed S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8. The Product Owner / Architect may explicitly approve or override development sequencing under `docs/ARCHITECT_AUTHORITY.md`; no override implies empirical validation or release approval.

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
S0 real-world validation remains incomplete and unapproved (0 actual participants and 0 independent reviews per the explicitly synthetic summary). The Product Owner / Architect approved S1 in Copilot chat on 2026-11-03; the S1 handoff records the approval, while the domain manifest remains draft because independent golden-case review and real-world calibration have not occurred. S2 foundation implementation is complete and `approved` by the human owner; S3 and S4 are `approved`; S5 is `approved` by explicit Product Owner chat approval. S6 quality hardening is `review_requested`, not approved; its handoff records an independent review finding a high-severity false-safe risk, the corrected business-goal mapping, incomplete product requirements, and outstanding accessibility, device, CI, and policy evidence. Synthetic cases are not validated customer cases, and no public launch is approved.
