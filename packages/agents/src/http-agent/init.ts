import { getPrisma as getPostgresDb } from ':aws-nx-poc/postgres-db';
import { getPrisma as getMySqlDb } from ':aws-nx-poc/my-sql-db';
import { initTRPC } from '@trpc/server';

export interface Context {
  sessionId: string;
  mySqlDb: Awaited<ReturnType<typeof getMySqlDb>>;
  postgresDb: Awaited<ReturnType<typeof getPostgresDb>>;
}

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;
