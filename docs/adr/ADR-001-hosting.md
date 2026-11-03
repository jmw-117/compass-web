# ADR-001 (superseding v1.1) — GitHub Pages deployment

**Status:** Approved *technical design preference* by product request; public commercial suitability remains human review required.
**Date:** 2 November 2026. **Decision:** GitHub Pages is the **only v1.2 deployment target**. Pure static Vite output from gated GitHub Actions, default project subpath `/silverspark-compass/`, no Workers, Cloudflare Pages, D1, API, database or paid AI inference.

**Rationale:** User requires GitHub Pages and free infrastructure; browser-local assessment, deterministic domain engine and HTML reports need no server. Ease of replicating and handing off to coding agents.

**Risks/constraints:** GitHub's Pages terms prohibit commercial SaaS or primarily running an online business; commercial distribution needs review. No automatic lead capture, login, remote sync, controlled arbitrary response headers, independent server telemetry or guaranteed PII security on third-party contact channels. `public/_headers` is ineffective. Avoid pushing assessment data to URLs; no payment/sensitive transactions. Custom-domain option is future decision, not active URL.

**Reversal condition:** If a production requirement demands commercial service hosting, server persistence, hard response security headers or operator authentication, halt that feature and obtain explicit new architectural and platform approval. Do not change hosting inside an agent PR.
