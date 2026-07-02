import { FC, FormEvent, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from ':aws-nx-poc/common-shadcn/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from ':aws-nx-poc/common-shadcn/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from ':aws-nx-poc/common-shadcn/components/ui/dialog';
import { Input } from ':aws-nx-poc/common-shadcn/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from ':aws-nx-poc/common-shadcn/components/ui/table';
import { Alert } from './alert';
import { Spinner } from './spinner';

export interface Entity {
  id?: number | null;
  name: string;
  description?: string | null;
}

export interface EntitiesTableProps {
  title: string;
  entities: Entity[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onAdd: (input: { name: string; description?: string }) => Promise<unknown>;
  isAdding: boolean;
  isAddError: boolean;
  onDelete: (id: number) => void;
  deletingId?: number | null;
}

export const EntitiesTable: FC<EntitiesTableProps> = ({
  title,
  entities,
  isLoading,
  isError,
  onAdd,
  isAdding,
  isAddError,
  onDelete,
  deletingId,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onAdd({ name, description: description || undefined });
      setOpen(false);
      resetForm();
    } catch {
      // isAddError surfaces the failure in the dialog
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) resetForm();
            }}
          >
            <Button
              onClick={() => setOpen(true)}
              size="sm"
            >
              <Plus />
              Add
            </Button>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add example</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" htmlFor="name">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-sm font-medium"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  {isAddError && (
                    <Alert type="error" header="Error">
                      Failed to add example.
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? <Spinner /> : 'Add'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <Alert type="error" header="Error">
            Failed to load examples.
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities?.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell>{entity.id}</TableCell>
                  <TableCell>{entity.name}</TableCell>
                  <TableCell>{entity.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={entity.id == null || deletingId === entity.id}
                      onClick={() => entity.id != null && onDelete(entity.id)}
                      aria-label={`Delete ${entity.name}`}
                    >
                      {deletingId === entity.id ? <Spinner /> : <Trash2 />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default EntitiesTable;
