import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/handler.ts',
    output: {
      file: '../../dist/packages/api/bundle/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
    external: [/@aws-sdk\/.*/],
  },
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/authorizer.ts',
    output: {
      file: '../../dist/packages/api/bundle/authorizer/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
    external: [/@aws-sdk\/.*/],
  },
]);
