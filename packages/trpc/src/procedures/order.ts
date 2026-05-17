import { randomUUID } from 'crypto';
import { createOrderEntity } from ':aws-nx-poc/table-two';
import { publicProcedure } from '../init.js';
import {
  AddOrderInputSchema,
  ListOrdersOutputSchema,
  OrderSchema,
} from '../schema/index.js';

export const listOrders = publicProcedure
  .output(ListOrdersOutputSchema)
  .query(async () => {
    const entity = await createOrderEntity();
    const result = await entity.scan.go();
    return { items: result.data, cursor: result.cursor ?? undefined };
  });

export const addOrder = publicProcedure
  .input(AddOrderInputSchema)
  .output(OrderSchema)
  .mutation(async ({ input }) => {
    const entity = await createOrderEntity();
    const result = await entity
      .create({ ...input, id: input.id ?? randomUUID() })
      .go();
    return result.data;
  });
