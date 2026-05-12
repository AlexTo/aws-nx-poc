import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerDivideTool } from './tools/divide.js';
import { registerSampleGuidanceResource } from './resources/sample-guidance.js';

/**
 * Create the MCP Server
 */
export const createServer = ({
  mySqlDb,
  postgresDb,
}: {
  mySqlDb: Awaited<ReturnType<typeof getMySqlDb>>;
  postgresDb: Awaited<ReturnType<typeof getPostgresDb>>;
}) => {
  const server = new McpServer({
    name: 'agents-mcp-server',
    version: '1.0.0',
  });

  registerDivideTool(server);
  registerSampleGuidanceResource(server);

  return server;
};
