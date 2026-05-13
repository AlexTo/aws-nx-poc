import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/handler.ts',
    output: {
      file: '../../../dist/packages/smithy/backend/bundle/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
    external: [/@aws-sdk\/.*/],
  },
]);
