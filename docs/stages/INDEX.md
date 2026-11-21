# Staged execution index — Silverspark Compass v1.2

S0–S8 describe product workstreams. They can progress independently as dependencies allow.

| Stage | Contract | Main output |
|---|---|---|
| S0 | [Concierge validation](S0-validation.md) | Study protocol, consent model, anonymized measurement log, reviewer rubric, decision changes |
| S1 | [Freeze decision contracts](S1-domain-contracts.md) | Versioned contract catalog, data/semantic version record, fixture diff, contract audit |
| S2 | [Repository, GitHub Pages and CI foundation](S2-pages-foundation.md) | Compilable app skeleton, commands and CI workflow, /compass-web/ browser/asset check |
| S3 | [Guided assessment and storage](S3-assessment-ux.md) | Working browser flow, real-device screenshots or findings, Playwright wizard tests |
| S4 | [Deterministic readiness evaluator](S4-engine.md) | Unit/property test evidence, fixture expected-versus-actual diff, decision trace |
| S5 | [Report and voluntary handoff](S5-report-share.md) | Accessible results/print flows, exact outbound payload examples, report-version evidence |
| S6 | [Independent QA and hardening](S6-quality-hardening.md) | QA report and prioritized defect log, release blockers resolved or documented |
| S7 | [GitHub Pages release](S7-pages-release.md) | Live URL and SHA evidence, workflow run proof, release log, rollback instructions |
| S8 | [Continuous calibration and maintenance](S8-calibration.md) | Release retrospective, revised backlog, versioned ADRs and fixture updates for future stages |

## Delivery

Record build, test and deployment evidence in the pull request or workflow. The former stage ledger and handoffs are historical records.
