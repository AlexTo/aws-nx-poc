#!/usr/bin/env node
import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

export const startMcpServer = async () => {
  const transport = new StdioServerTransport();
  const mySqlDb = await getMySqlDb();
  const postgresDb = await getPostgresDb();
  await createServer({ mySqlDb, postgresDb }).connect(transport);
  console.error('MCP Server listening on STDIO');
};

void (async () => {
  try {
    await startMcpServer();
  } catch (e) {
    console.error(e);
  }
})();
