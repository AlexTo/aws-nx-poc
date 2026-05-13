import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerDivideTool } from './tools/divide.js';
import { registerSampleGuidanceResource } from './resources/sample-guidance.js';

/**
 * Create the MCP Server
 */
export const createServer = async () => {
  const postgresDb = await getPostgresDb();
  postgresDb.$on('error' as never, (e) => {
    console.log(e);
  });
  const mySqlDb = await getMySqlDb();
  mySqlDb.$on('error' as never, (e) => {
    console.log(e);
  });
  const server = new McpServer({
    name: 'agents-mcp-server',
    version: '1.0.0',
  });

  registerDivideTool(server);
  registerSampleGuidanceResource(server);

  return server;
};
