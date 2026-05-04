import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Button } from ':aws-nx-poc/common-shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from ':aws-nx-poc/common-shadcn/components/ui/dialog';
import { Input } from ':aws-nx-poc/common-shadcn/components/ui/input';

export const Route = createFileRoute('/companies')({
  component: RouteComponent,
});

function RouteComponent() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { data: companies = [] } = useQuery(api.listCompanies.queryOptions());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');

  const addCompany = useMutation({
    ...api.addCompany.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.listCompanies.queryOptions().queryKey,
      });
      setOpen(false);
      setName('');
      setWebsite('');
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <Button onClick={() => setOpen(true)}>Create</Button>
      </div>

      <div className="rounded-lg border">
        {companies.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No companies yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Website</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {company.id}
                  </td>
                  <td className="px-4 py-3">{company.name}</td>
                  <td className="px-4 py-3">{company.website}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!name || !website || addCompany.isPending}
              onClick={() => addCompany.mutate({ name, website })}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
