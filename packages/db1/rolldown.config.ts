import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/migration-handler.ts',
    output: {
      file: '../../dist/packages/db1/bundle/migration/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
  },
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/create-db-user-handler.ts',
    output: {
      file: '../../dist/packages/db1/bundle/create-db-user/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
  },
]);
