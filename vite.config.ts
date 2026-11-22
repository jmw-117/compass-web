import {readFileSync} from 'node:fs';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: process.env.COMPASS_BASE_PATH || '/compass-web/',
  plugins: [react(), {
    name: 'compass-site-metadata',
    transformIndexHtml: {order:'pre',handler: html => {
      const canonical = new URL(process.env.COMPASS_SITE_URL || 'https://jmw-117.github.io/compass-web/');
      return html.replaceAll('__COMPASS_SITE__',canonical.href.replace(/\/?$/, '/'));
    }},
    generateBundle() {
      this.emitFile({type:'asset',fileName:'social-preview.png',source:readFileSync('src/assets/social-preview.png')});
    },
  }],
  publicDir: false,
});
