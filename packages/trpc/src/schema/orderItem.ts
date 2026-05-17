import { z } from 'zod';

export const OrderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  createdAt: z.string(),
});

export const AddOrderItemInputSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

export const ListOrderItemsOutputSchema = z.object({
  items: z.array(OrderItemSchema),
  cursor: z.string().optional(),
});
