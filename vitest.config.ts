import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // fileConverters relies on browser APIs (DOMParser, File, Blob, URL.createObjectURL)
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
