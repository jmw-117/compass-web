# S6 — Independent QA and hardening

**Stage outcome:** Defect detection, performance, security and browser audit.

## Bounded execution scope
Playwright matrix, axe, real Android/iOS spot checks, fail cases, local storage, dependency and bundle checks.

## Deliverables
QA report and prioritized defect log, release blockers resolved or documented.

## Non-goals and disallowed shortcuts
No fabricated pass claims; avoid modifying product semantics to make tests pass. Observe `AGENTS.md`, GitHub Pages static-only architecture, privacy boundaries and immutable approved contract versions.

## Verification
No critical a11y, privacy or false-safe failures; quality gates pass on clean checkout.

## Product requirements

Add test coverage for all 23 product requirements; verify expanded branch conditions, 18 deep option IDs, 14 core inputs, document output, screen-reader behavior, no hidden network submissions.
