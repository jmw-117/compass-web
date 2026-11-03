# Silverspark Compass — Developer starter v1.3.1

The repository now has a strict TypeScript, React, and Vite application shell for GitHub Pages. **This S2 foundation is not yet the working assessment product:** it provides a designed landing page, progressive enhancement, a lazy-loaded report-module placeholder, and reproducible checks. It does not collect answers, score readiness, recommend actions, or generate reports.

## Quick start (Windows, macOS, Linux)

1. Install Node.js 22 LTS (20.19 or later is required).
2. From the repository root, run:

   ```bash
   npm ci
   npm run verify
   npm run dev
   ```

3. Visit the project-base URL printed by Vite (normally **http://127.0.0.1:5173/silverspark-compass/**).
4. To inspect the production build locally:

   ```bash
   npm run build
   npm run check:assets
   npm run preview
   ```

The build uses `/silverspark-compass/` as the Vite base path for GitHub Pages project hosting. The existing `public/` files are retained as S0 pilot source material and are not copied into the S2 application build.

## Continuous integration and Pages

`.github/workflows/deploy-pages.yml` runs locked dependency installation, contract checks, type checking, tests, production build, asset checks, and the Python contract validators on pushes and pull requests for `main`, `codex`, `develop`, `maintenance`, and `upgrade`.

The Pages deploy job is manually gated: normal pushes and pull requests do not publish. A maintainer can dispatch the workflow on `main` with `deploy` enabled only after the S7 release approval and the GitHub Pages commercial-use policy review. The workflow has not been run against the hosted repository here; branch protection and environment approvals must be configured and verified by a maintainer.

## Product and privacy boundary

Compass is intended to give prospective clients a self-reported readiness assessment. The core questionnaire, interval evaluator, recommendations, technical diagnostic, full report, and voluntary sharing flow belong to later authorized stages and are not implemented by this foundation. This shell sends no answers to any service and uses no analytics or model API. Do not enter real confidential client data into repository files or test logs.

The legacy S0 preview sources remain in `public/`; they are not the current app entry point and are excluded from `dist/`. See `docs/stages/` and `docs/handoffs/ledger.json` for stage scope and approval state.
