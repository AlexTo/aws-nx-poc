import { randomUUID } from 'crypto';
import { createCategoryEntity } from ':aws-nx-poc/table-one';
import { publicProcedure } from '../init.js';
import {
  AddCategoryInputSchema,
  CategorySchema,
  ListCategoriesOutputSchema,
} from '../schema/index.js';

export const listCategories = publicProcedure
  .output(ListCategoriesOutputSchema)
  .query(async () => {
    const entity = await createCategoryEntity();
    const result = await entity.scan.go();
    return { items: result.data, cursor: result.cursor ?? undefined };
  });

export const addCategory = publicProcedure
  .input(AddCategoryInputSchema)
  .output(CategorySchema)
  .mutation(async ({ input }) => {
    const entity = await createCategoryEntity();
    const result = await entity
      .create({ ...input, id: input.id ?? randomUUID() })
      .go();
    return result.data;
  });
