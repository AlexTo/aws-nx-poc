import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.number(),
  name: z.string(),
  website: z.string(),
});

export type ICompany = z.TypeOf<typeof CompanySchema>;

export const AddCompanyInputSchema = z.object({
  name: z.string(),
  website: z.string(),
});

export type IAddCompanyInput = z.TypeOf<typeof AddCompanyInputSchema>;
