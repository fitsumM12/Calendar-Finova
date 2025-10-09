import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  treeshake: true,
  outDir: 'dist',
  // This will handle .ts -> .mjs/.cjs conversion
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.mjs' : '.cjs'
  })
});