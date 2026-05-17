import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/http-agent/index.ts',
    output: {
      file: '../../dist/packages/agents/bundle/agent/http-agent/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
  },
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/a2-aagent/index.ts',
    output: {
      file: '../../dist/packages/agents/bundle/agent/a2-aagent/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
  },
  {
    tsconfig: 'tsconfig.lib.json',
    input: 'src/mcp-server/http.ts',
    output: {
      file: '../../dist/packages/agents/bundle/mcp/agents-mcp-server/index.js',
      format: 'cjs',
      inlineDynamicImports: true,
    },
    platform: 'node',
  },
]);
