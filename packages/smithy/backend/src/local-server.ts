import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { IncomingMessage, ServerResponse, createServer } from 'http';
import { convertRequest, writeResponse } from '@aws-smithy/server-node';
import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Service } from './service.js';
import { getSmithyServiceHandler } from './generated/ssdk/index.js';

const PORT = 3001;

const tracer = new Tracer();
const logger = new Logger();
const metrics = new Metrics();

const serviceHandler = getSmithyServiceHandler(Service);

const server = createServer(async function (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const httpRequest = convertRequest(req);
  const postgresDb = await getPostgresDb();
  const mySqlDb = await getMySqlDb();
  const httpResponse = await serviceHandler.handle(httpRequest, {
    tracer,
    logger,
    metrics,
    postgresDb,
    mySqlDb,
  });
  return writeResponse(httpResponse, res);
});

server.listen(PORT);
console.log(`Started server on port ${PORT}...`);
