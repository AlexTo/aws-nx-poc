import { createProviderEntity } from ':aws-nx-poc/dynamodb3';
import { randomUUID } from 'crypto';
import { publicProcedure } from '../init.js';
import {
  AddProviderInputSchema,
  ListProvidersOutputSchema,
  ProviderSchema,
} from '../schema/index.js';

export const listProviders = publicProcedure
  .output(ListProvidersOutputSchema)
  .query(async () => {
    const entity = await createProviderEntity();
    const { data } = await entity.scan.go();
    return { items: data };
  });

export const addProvider = publicProcedure
  .input(AddProviderInputSchema)
  .output(ProviderSchema)
  .mutation(async (opts) => {
    const entity = await createProviderEntity();
    const { data } = await entity
      .put({ id: randomUUID(), name: opts.input.name })
      .go();
    return data;
  });
