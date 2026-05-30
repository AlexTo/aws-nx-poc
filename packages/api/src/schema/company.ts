import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AddCompanyInputSchema = z.object({
  name: z.string(),
});

export const ListCompaniesOutputSchema = z.object({
  items: z.array(CompanySchema),
});

export type ICompany = z.TypeOf<typeof CompanySchema>;
export type IAddCompanyInput = z.TypeOf<typeof AddCompanyInputSchema>;
export type IListCompaniesOutput = z.TypeOf<typeof ListCompaniesOutputSchema>;
