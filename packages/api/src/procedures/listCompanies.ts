import { getPrisma } from ':aws-nx-poc/postgresdb';
import { publicProcedure } from '../init.js';
import { CompanySchema } from '../schema/index.js';
import { z } from 'zod';

export const listCompanies = publicProcedure
  .output(z.array(CompanySchema))
  .query(async () => {
    const prisma = await getPrisma();
    return await prisma.company.findMany();
  });
