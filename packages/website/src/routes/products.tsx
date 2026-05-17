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

export const Route = createFileRoute('/products')({
  component: ProductsPage,
});

function ProductsPage() {
  const trpc = useTrpc();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const listQuery = useQuery(trpc.product.list.queryOptions());

  const addMutation = useMutation({
    ...trpc.product.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.product.list.queryOptions().queryKey,
      });
      setOpen(false);
      setCategoryId('');
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
    },
  });

  const handleSubmit = () => {
    if (!categoryId.trim() || !name.trim() || !price) return;
    addMutation.mutate({
      categoryId: categoryId.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      stock: stock ? Number(stock) : undefined,
    });
  };

  const isValid =
    categoryId.trim() && name.trim() && price && Number(price) >= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
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
                <th className="px-4 py-3 text-left font-medium">Category ID</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
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
                  <td className="px-4 py-3 font-mono text-xs">
                    {item.categoryId}
                  </td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.description ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">{item.stock}</td>
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
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No products yet.
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
            <SheetTitle>Create Product</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Category ID *</label>
              <Input
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="Category ID"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Laptop"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Price *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
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
