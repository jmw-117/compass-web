import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: '/silverspark-compass/',
  plugins: [react()],
  publicDir: false,
});
