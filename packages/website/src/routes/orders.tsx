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

export const Route = createFileRoute('/orders')({
  component: OrdersPage,
});

const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

function OrdersPage() {
  const trpc = useTrpc();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [status, setStatus] =
    useState<(typeof ORDER_STATUSES)[number]>('pending');
  const [total, setTotal] = useState('');

  const listQuery = useQuery(trpc.order.list.queryOptions());

  const addMutation = useMutation({
    ...trpc.order.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.order.list.queryOptions().queryKey,
      });
      setOpen(false);
      setUserId('');
      setStatus('pending');
      setTotal('');
    },
  });

  const handleSubmit = () => {
    if (!userId.trim() || !total) return;
    addMutation.mutate({ userId: userId.trim(), status, total: Number(total) });
  };

  const isValid = userId.trim() && total && Number(total) >= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
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
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">User ID</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Created At</th>
                <th className="px-4 py-3 text-left font-medium">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.userId}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize">{item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.createdAt}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.updatedAt}
                  </td>
                </tr>
              ))}
              {listQuery.data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No orders yet.
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
            <SheetTitle>Create Order</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">User ID *</label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as (typeof ORDER_STATUSES)[number])
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Total *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
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
