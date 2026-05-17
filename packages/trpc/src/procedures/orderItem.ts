import { createOrderItemEntity } from ':aws-nx-poc/table-two';
import { publicProcedure } from '../init.js';
import {
  AddOrderItemInputSchema,
  ListOrderItemsOutputSchema,
  OrderItemSchema,
} from '../schema/index.js';

export const listOrderItems = publicProcedure
  .output(ListOrderItemsOutputSchema)
  .query(async () => {
    const entity = await createOrderItemEntity();
    const result = await entity.scan.go();
    return { items: result.data, cursor: result.cursor ?? undefined };
  });

export const addOrderItem = publicProcedure
  .input(AddOrderItemInputSchema)
  .output(OrderItemSchema)
  .mutation(async ({ input }) => {
    const entity = await createOrderItemEntity();
    const result = await entity.create(input).go();
    return result.data;
  });
