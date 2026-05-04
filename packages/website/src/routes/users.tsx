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

export const Route = createFileRoute('/users')({
  component: RouteComponent,
});

function RouteComponent() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery(api.listUsers.queryOptions());
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const addUser = useMutation({
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button onClick={() => setOpen(true)}>Create</Button>
      </div>

      <div className="rounded-lg border">
        {users.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No users yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">First Name</th>
                <th className="px-4 py-3 text-left font-medium">Last Name</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{user.id}</td>
                  <td className="px-4 py-3">{user.firstName}</td>
                  <td className="px-4 py-3">{user.lastName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!firstName || !lastName || addUser.isPending}
              onClick={() => addUser.mutate({ firstName, lastName })}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
