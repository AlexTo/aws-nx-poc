import { t } from './init.js';
import { listCategories, addCategory } from './procedures/category.js';
import { listProducts, addProduct } from './procedures/product.js';
import { listOrders, addOrder } from './procedures/order.js';
import { listOrderItems, addOrderItem } from './procedures/orderItem.js';

export const router = t.router;

export const appRouter = router({
  category: router({
    list: listCategories,
    add: addCategory,
  }),
  product: router({
    list: listProducts,
    add: addProduct,
  }),
  order: router({
    list: listOrders,
    add: addOrder,
  }),
  orderItem: router({
    list: listOrderItems,
    add: addOrderItem,
  }),
});

export type AppRouter = typeof appRouter;
