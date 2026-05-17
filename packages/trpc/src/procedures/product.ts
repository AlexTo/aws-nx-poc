import { randomUUID } from 'crypto';
import { createProductEntity } from ':aws-nx-poc/table-one';
import { publicProcedure } from '../init.js';
import {
  AddProductInputSchema,
  ListProductsOutputSchema,
  ProductSchema,
} from '../schema/index.js';

export const listProducts = publicProcedure
  .output(ListProductsOutputSchema)
  .query(async () => {
    const entity = await createProductEntity();
    const result = await entity.scan.go();
    return { items: result.data, cursor: result.cursor ?? undefined };
  });

export const addProduct = publicProcedure
  .input(AddProductInputSchema)
  .output(ProductSchema)
  .mutation(async ({ input }) => {
    const entity = await createProductEntity();
    const result = await entity
      .create({ ...input, id: input.id ?? randomUUID() })
      .go();
    return result.data;
  });
