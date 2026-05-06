import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from ':ts-rdb-terraform/common-shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from ':ts-rdb-terraform/common-shadcn/components/ui/dialog';
import { Input } from ':ts-rdb-terraform/common-shadcn/components/ui/input';
import { Spinner } from '../components/spinner';
import { useApi } from '../hooks/useApi';

export const Route = createFileRoute('/companies')({
  component: CompaniesPage,
});

function CompaniesPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');

  const { data: companies, isLoading } = useQuery(
    api.listCompanies.queryOptions(),
  );

  const createCompany = useMutation({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany.mutate({ name, website });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Company</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
              <DialogFooter>
                <Button type="submit" disabled={createCompany.isPending}>
                  {createCompany.isPending ? <Spinner /> : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-16">ID</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Website</th>
              </tr>
            </thead>
            <tbody>
              {!companies?.length ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-muted-foreground px-4 py-8"
                  >
                    No companies yet.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">
                      {company.id}
                    </td>
                    <td className="px-4 py-3">{company.name}</td>
                    <td className="px-4 py-3">{company.website}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
