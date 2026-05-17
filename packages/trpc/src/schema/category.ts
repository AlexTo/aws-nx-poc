import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AddCategoryInputSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
});

export const ListCategoriesOutputSchema = z.object({
  items: z.array(CategorySchema),
  cursor: z.string().optional(),
});
