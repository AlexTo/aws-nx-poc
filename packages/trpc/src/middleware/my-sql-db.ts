import { getPrisma } from ':aws-nx-poc/my-sql-db';
import { initTRPC } from '@trpc/server';

export interface IMySqlDbContext {
  mySqlDb?: Awaited<ReturnType<typeof getPrisma>>;
}

export const createMySqlDbPlugin = () => {
  const t = initTRPC.context<IMySqlDbContext>().create();
  return t.procedure.use(async (opts) => {
    const mySqlDb = await getPrisma();

    try {
      return await opts.next({
        ctx: {
          ...opts.ctx,
          mySqlDb,
        },
      });
    } finally {
      await mySqlDb.$disconnect();
    }
  });
};
