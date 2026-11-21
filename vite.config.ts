import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: process.env.COMPASS_BASE_PATH || '/silverspark-compass/',
  plugins: [react()],
  publicDir: false,
});
