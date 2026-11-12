import { viteSingleFile } from 'vite-plugin-singlefile';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: { port: 5173 }
});
