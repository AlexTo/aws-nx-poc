import { z } from 'zod';

export const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AddProviderInputSchema = z.object({
  name: z.string(),
});

export const ListProvidersOutputSchema = z.object({
  items: z.array(ProviderSchema),
});

export type IProvider = z.TypeOf<typeof ProviderSchema>;
export type IAddProviderInput = z.TypeOf<typeof AddProviderInputSchema>;
export type IListProvidersOutput = z.TypeOf<typeof ListProvidersOutputSchema>;
