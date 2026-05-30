import { createCompanyEntity } from ':aws-nx-poc/dynamodb2';
import { randomUUID } from 'crypto';
import { publicProcedure } from '../init.js';
import {
  AddCompanyInputSchema,
  CompanySchema,
  ListCompaniesOutputSchema,
} from '../schema/index.js';

export const listCompanies = publicProcedure
  .output(ListCompaniesOutputSchema)
  .query(async () => {
    const entity = await createCompanyEntity();
    const { data } = await entity.scan.go();
    return { items: data };
  });

export const addCompany = publicProcedure
  .input(AddCompanyInputSchema)
  .output(CompanySchema)
  .mutation(async (opts) => {
    const entity = await createCompanyEntity();
    const { data } = await entity
      .put({ id: randomUUID(), name: opts.input.name })
      .go();
    return data;
  });
