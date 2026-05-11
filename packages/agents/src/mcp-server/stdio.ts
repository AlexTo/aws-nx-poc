#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

export const startMcpServer = async () => {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
  console.error('MCP Server listening on STDIO');
};

void (async () => {
  try {
    await startMcpServer();
  } catch (e) {
    console.error(e);
  }
})();
