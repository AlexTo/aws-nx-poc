import { getPrisma } from ':ts-rdb-terraform/mysqldb';
import { publicProcedure } from '../init.js';
import { CompanySchema } from '../schema/index.js';
import { z } from 'zod';

export const listCompanies = publicProcedure
  .output(z.array(CompanySchema))
  .query(async () => {
    const prisma = await getPrisma();
    try {
      return await prisma.company.findMany();
    } finally {
      await prisma.$disconnect();
    }
  });
