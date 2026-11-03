# Silverspark Compass — Working Developer Starter v1.3.1

**This is a repaired, executable starter for the S0 pilot, not the completed Compass application.** The previous ZIP contained only specifications and a GitHub Actions template; it had no `package.json`, HTML entry, npm scripts or running server. This release fixes those omissions without pretending the AI readiness engine or final report has been built.

## Quick start (Windows, macOS, Linux)

1. Extract the **contents** of this ZIP into the root of a folder named `silverspark-compass`, preserving hidden `.github/` files. Do not put the entire ZIP file inside the repository.
2. Open that folder in VS Code (File → Open Folder). Open the terminal in this exact folder. You should see `package.json`, `AGENTS.md`, `README.md`, `docs/` and `.github/` at its root.
3. Install Node.js 22 LTS or any version >= 20.19.
4. Run:

   ```bash
   npm ci
   npm run verify
   npm run dev
   ```

5. Visit **http://localhost:4173/** and use the fourteen-question S0 pilot. The pilot is local-only, saves answers in `sessionStorage` where available and supports a user-controlled JSON download. It deliberately does **not** score readiness or send leads.
6. To test the GitHub Pages build, run:

   ```bash
   npm run build
   npm run check:assets
   npm run preview
   ```

7. Set the GitHub repository name to `silverspark-compass`. Under **Settings → Pages → Build and deployment**, select **GitHub Actions**. The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the static pilot on pushes to `main`. The pilot is **not** an approved commercial deployment.

**What works now:** npm install (no third-party dependencies for the bootstrap), local pilot website, question navigation, session responses, JSON export, Node contract checks, unit tests, static build and static hosting. No dependency installation is required beyond Node for these commands.

**What still needs implementation:** client discovery enhancements, conditional probes, production UX, scoring/risk-gate engine, budget-aware action ranking, technical extension, verified reporting, QA/a11y and consultant workflow. These are fully specified in `docs/PRODUCT_TECHNICAL_SPECIFICATION.md`, but remain pending stages S1–S8.

## Codex and Copilot

- **Codex** reads root `AGENTS.md` automatically. Start with `CODEX_STARTER_PROMPT.md` and `.github/prompts/S0.prompt.md`.
- **Copilot** uses `.github/copilot-instructions.md`, and can use `.github/prompts/S0.prompt.md` with the relevant agent workflow.
- `docs/handoffs/ledger.json` is the source for stage status. Stages are not auto-approved.
- S0: validate instrument, collect real pilot evidence, request human approval.
- S1: freeze business rules, independent golden-case review.
- S2: migrate this dependency-free bootstrap to the specified **React + Vite + TypeScript** application with a new lockfile, type checks and full CI. Keep the GitHub Pages project-base path `/silverspark-compass/`.
- S3–S8: follow `docs/stages/` and handoffs. Do not let agents invent approved business rules.

## Troubleshooting

- `npm ERR! enoent package.json`: you are not in the extracted repository root.
- `npm ci` fails: ensure `package.json` and `package-lock.json` are both present; Node 22 recommended.
- Page blank: open the link printed by `npm run dev`, not the local `index.html` as a `file://` URL. Use browser developer tools for errors.
- GitHub Pages 404: choose GitHub Actions as source, check Actions run and repository name, and visit `https://<user>.github.io/silverspark-compass/`.
- No working readiness result yet: expected. This package is an S0 pilot and agent engineering scaffold, not the completed V1 product.
- Windows: use PowerShell or the VS Code terminal; run `node --version` and `npm --version` before setup.

## Manual independent validators

```bash
python scripts/validate_kit.py
python scripts/validate_product_v13.py
```

## Privacy and hosting constraints

This local prototype sends no answer data to a server. GitHub hosting logs and platform telemetry are separate from app-level submission. Do not put real confidential customer information into the repo. A GitHub Pages commercial launch must still be assessed against GitHub's published terms. Do not use this unvalidated pilot as a client-facing accredited score.
