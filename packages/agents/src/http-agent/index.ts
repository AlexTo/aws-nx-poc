import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { randomUUID } from 'node:crypto';
import { createServer } from 'http';
import {
  CreateHTTPContextOptions,
  createHTTPHandler,
} from '@trpc/server/adapters/standalone';
import { appRouter, AppRouter } from './router.js';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import {
  CreateWSSContextFnOptions,
  applyWSSHandler,
} from '@trpc/server/adapters/ws';
import { Context } from './init.js';

const PORT = parseInt(process.env.PORT || '8080');

const createContext = async (
  opts: CreateHTTPContextOptions | CreateWSSContextFnOptions,
): Promise<Context> => {
  const postgresDb = await getPostgresDb();
  const mySqlDb = await getMySqlDb();
  const sessionId =
    ('req' in opts
      ? opts.req.headers['x-amzn-bedrock-agentcore-runtime-session-id']
      : undefined) ?? randomUUID();
  return {
    sessionId: Array.isArray(sessionId) ? sessionId[0] : sessionId,
    mySqlDb,
    postgresDb,
  };
};

const handler = createHTTPHandler({
  router: appRouter,
  middleware: cors(),
  createContext,
});

const server = createServer((req, res) => {
  const url = new URL(req.url || '', `https://${req.headers.host}`);

  // Handle bedrock agentcore health check
  if (url.pathname === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Healthy');
    return;
  }

  // Handle other requests with tRPC
  handler(req, res);
});

const wss = new WebSocketServer({
  server,
  path: '/ws',
});

applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext,
});

server.listen(PORT);

console.log(`TRPC server listening on port ${PORT}`);
