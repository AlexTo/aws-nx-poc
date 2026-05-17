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

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
});

function CategoriesPage() {
  const trpc = useTrpc();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const listQuery = useQuery(trpc.category.list.queryOptions());

  const addMutation = useMutation({
    ...trpc.category.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.category.list.queryOptions().queryKey,
      });
      setOpen(false);
      setName('');
      setDescription('');
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    addMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
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
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
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
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.description ?? '—'}
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
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No categories yet.
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
            <SheetTitle>Create Category</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Electronics"
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
              disabled={addMutation.isPending || !name.trim()}
            >
              {addMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
