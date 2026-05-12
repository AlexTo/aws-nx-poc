import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { A2AExpressServer } from '@strands-agents/sdk/a2a/express';
import express from 'express';
import { getAgent } from './agent.js';

const PORT = parseInt(process.env.PORT || '9000');
const HOST = '0.0.0.0';

void (async () => {
  const httpUrl =
    process.env.AGENTCORE_RUNTIME_URL ?? `http://localhost:${PORT}/`;

  const mySqlDb = await getMySqlDb();
  const postgresDb = await getPostgresDb();
  const server = new A2AExpressServer({
    agent: await getAgent('default', { mySqlDb, postgresDb }),
    name: 'A2aAgent',
    description:
      'A Strands Agent exposed via the Agent-to-Agent (A2A) protocol.',
    host: HOST,
    port: PORT,
    httpUrl,
  });

  const app = express();
  app.get('/ping', (_req, res) => res.status(200).json({ status: 'Healthy' }));
  app.use(server.createMiddleware());
  app.listen(PORT, HOST, () => {
    console.log(`A2A server listening on ${HOST}:${PORT}`);
  });
})();
