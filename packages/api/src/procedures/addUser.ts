import { getPrisma } from ':aws-nx-poc/mysqldb';
import { publicProcedure } from '../init.js';
import { AddUserInputSchema, UserSchema } from '../schema/index.js';

export const addUser = publicProcedure
  .input(AddUserInputSchema)
  .output(UserSchema)
  .mutation(async ({ input }) => {
    const prisma = await getPrisma();
    return prisma.user.create({ data: input });
  });
