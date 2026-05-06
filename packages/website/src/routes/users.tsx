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

export const Route = createFileRoute('/users')({
  component: UsersPage,
});

function UsersPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const { data: users, isLoading } = useQuery(api.listUsers.queryOptions());

  const createUser = useMutation({
    ...api.addUser.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.listUsers.queryOptions().queryKey,
      });
      setOpen(false);
      setFirstName('');
      setLastName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({ firstName, lastName });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <DialogFooter>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? <Spinner /> : 'Create'}
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
                <th className="text-left px-4 py-3 font-medium">First Name</th>
                <th className="text-left px-4 py-3 font-medium">Last Name</th>
              </tr>
            </thead>
            <tbody>
              {!users?.length ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-muted-foreground px-4 py-8"
                  >
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.id}
                    </td>
                    <td className="px-4 py-3">{user.firstName}</td>
                    <td className="px-4 py-3">{user.lastName}</td>
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
