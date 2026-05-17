import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: OrderStatusSchema,
  total: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AddOrderInputSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  status: OrderStatusSchema.optional(),
  total: z.number(),
});

export const ListOrdersOutputSchema = z.object({
  items: z.array(OrderSchema),
  cursor: z.string().optional(),
});
