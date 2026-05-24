import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/mcp-server/http.ts',
    output: {
      file: '../../dist/packages/inventory/bundle/mcp/inventory-mcp-server/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
  },
]);
