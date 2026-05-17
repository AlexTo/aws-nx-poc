import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AddProductInputSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number().optional(),
});

export const ListProductsOutputSchema = z.object({
  items: z.array(ProductSchema),
  cursor: z.string().optional(),
});
