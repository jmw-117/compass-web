# Repair notes: v1.3 → v1.3.1

## Verified original failure

The original 55-entry ZIP was valid (CRC passed), but it had no `package.json`, no package lock, no browser app, no `npm run dev`, and an Actions file explicitly marked TEMPLATE, referencing nonexistent scripts. It was an engineering specifications archive, not a runnable project.

## Fixed

- Added dependency-free S0 browser pilot using the existing 14-question bank (local-only; no readiness scoring).
- Added `package.json` and matching zero-dependency `package-lock.json`.
- Added development HTTP server, static build, asset checks, Node contract checks and unit tests.
- Replaced CI template with an executable GitHub Pages workflow, pinned to action SHAs documented in Vite's official guide.
- Rewrote README and Codex starter to remove overlapping outdated version instructions and clarify S0→S2 transition.
- Preserved product technical specifications and existing 14/18 question contracts, recommendation catalog, nine-stage handoffs and Python validators.

## Explicit boundaries

`npm run dev` runs the **S0 pilot**, not the final Compass application. React/Vite/TypeScript should be added in S2 after signed S0/S1 approvals. No vendor API, backend, AI inference, production score or CRM lead intake exists yet.
