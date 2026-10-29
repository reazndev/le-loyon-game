import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths so the Electron build can load dist/index.html over file://.
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
