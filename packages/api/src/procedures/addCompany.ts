import { getPrisma } from ':ts-rdb-terraform/mysqldb';
import { publicProcedure } from '../init.js';
import { AddCompanyInputSchema, CompanySchema } from '../schema/index.js';

export const addCompany = publicProcedure
  .input(AddCompanyInputSchema)
  .output(CompanySchema)
  .mutation(async ({ input }) => {
    const prisma = await getPrisma();
    return prisma.company.create({ data: input });
  });
