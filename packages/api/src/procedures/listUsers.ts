import { getPrisma } from ':ts-rdb-terraform/postgresdb';
import { publicProcedure } from '../init.js';
import { UserSchema } from '../schema/index.js';
import { z } from 'zod';

export const listUsers = publicProcedure
  .output(z.array(UserSchema))
  .query(async () => {
    const prisma = await getPrisma();
    return await prisma.user.findMany();
  });
