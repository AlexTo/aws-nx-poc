import { getPrisma } from ':aws-nx-poc/postgres-db';
import { initTRPC } from '@trpc/server';

export interface IPostgresDbContext {
  postgresDb?: Awaited<ReturnType<typeof getPrisma>>;
}

export const createPostgresDbPlugin = () => {
  const t = initTRPC.context<IPostgresDbContext>().create();
  return t.procedure.use(async (opts) => {
    const postgresDb = await getPrisma();

    try {
      return await opts.next({
        ctx: {
          ...opts.ctx,
          postgresDb,
        },
      });
    } finally {
      await postgresDb.$disconnect();
    }
  });
};
