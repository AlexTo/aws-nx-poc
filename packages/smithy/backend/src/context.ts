import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

/**
 * Context provided to all operations.
 */
export interface ServiceContext {
  tracer: Tracer;
  logger: Logger;
  metrics: Metrics;
  postgresDb: Awaited<ReturnType<typeof getPostgresDb>>;
  mySqlDb: Awaited<ReturnType<typeof getMySqlDb>>;
}
