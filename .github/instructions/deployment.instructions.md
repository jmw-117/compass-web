---
applyTo: ".github/workflows/**/*,vite.config.*,public/**/*"
---
# GitHub Pages deployment instructions
Only GitHub Pages V1.2. Use the GitHub repository-name subpath for the Actions build. Test it through the asset checker. Use SHA-pinned Actions, locked dependencies, separate CI quality and gated deploy, no secrets in frontend, no Worker/D1/Cloudflare. Do not treat `_headers` as active on GitHub Pages. Test deployed HTTPS and asset paths before claiming success.
