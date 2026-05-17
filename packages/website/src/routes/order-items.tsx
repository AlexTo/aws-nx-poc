import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from ':aws-nx-poc/common-shadcn/components/ui/button';
import { Input } from ':aws-nx-poc/common-shadcn/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from ':aws-nx-poc/common-shadcn/components/ui/sheet';
import { useTrpc } from '../hooks/useTrpc';

export const Route = createFileRoute('/order-items')({
  component: OrderItemsPage,
});

function OrderItemsPage() {
  const trpc = useTrpc();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const listQuery = useQuery(trpc.orderItem.list.queryOptions());

  const addMutation = useMutation({
    ...trpc.orderItem.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.orderItem.list.queryOptions().queryKey,
      });
      setOpen(false);
      setOrderId('');
      setProductId('');
      setQuantity('');
      setUnitPrice('');
    },
  });

  const handleSubmit = () => {
    if (!orderId.trim() || !productId.trim() || !quantity || !unitPrice) return;
    addMutation.mutate({
      orderId: orderId.trim(),
      productId: productId.trim(),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
    });
  };

  const isValid =
    orderId.trim() &&
    productId.trim() &&
    quantity &&
    Number(quantity) > 0 &&
    unitPrice &&
    Number(unitPrice) >= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order Items</h1>
        <Button onClick={() => setOpen(true)}>Create</Button>
      </div>

      {listQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}

      {listQuery.data && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order ID</th>
                <th className="px-4 py-3 text-left font-medium">Product ID</th>
                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                <th className="px-4 py-3 text-left font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.items.map((item, idx) => (
                <tr
                  key={`${item.orderId}-${item.productId}-${idx}`}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {item.orderId}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {item.productId}
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.createdAt}
                  </td>
                </tr>
              ))}
              {listQuery.data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No order items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Order Item</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Order ID *</label>
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Product ID *</label>
              <Input
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Product ID"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Unit Price *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {addMutation.error && (
              <p className="text-sm text-destructive">
                {String(addMutation.error)}
              </p>
            )}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button
              onClick={handleSubmit}
              disabled={addMutation.isPending || !isValid}
            >
              {addMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
