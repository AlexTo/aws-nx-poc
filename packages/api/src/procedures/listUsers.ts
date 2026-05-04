import { getPrisma } from ':aws-nx-poc/mysqldb';
import { publicProcedure } from '../init.js';
import { UserSchema } from '../schema/index.js';
import { z } from 'zod';

export const listUsers = publicProcedure
  .output(z.array(UserSchema))
  .query(async () => {
    const prisma = await getPrisma();
    try {
      return await prisma.user.findMany();
    } finally {
      await prisma.$disconnect();
    }
  });
