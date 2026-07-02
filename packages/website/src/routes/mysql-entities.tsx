import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import EntitiesTable from '../components/EntitiesTable';
import { useApi2 } from '../hooks/useApi2';

export const Route = createFileRoute('/mysql-entities')({
  component: RouteComponent,
});

function RouteComponent() {
  const api2 = useApi2();
  const queryClient = useQueryClient();

  const { data: examples, isLoading, isError } = useQuery(
    api2.listExamples.queryOptions(),
  );

  const { mutateAsync: addExample, isPending: isAdding, isError: isAddError } =
    useMutation(
      api2.addExample.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(api2.listExamples.queryFilter());
        },
      }),
    );

  const {
    mutate: deleteExample,
    isPending: isDeleting,
    variables: deletingRequest,
  } = useMutation(
    api2.deleteExample.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(api2.listExamples.queryFilter());
      },
    }),
  );

  return (
    <EntitiesTable
      title="MySQL Entities"
      entities={examples}
      isLoading={isLoading}
      isError={isError}
      onAdd={addExample}
      isAdding={isAdding}
      isAddError={isAddError}
      onDelete={(exampleId) => deleteExample({ exampleId })}
      deletingId={isDeleting ? deletingRequest?.exampleId : null}
    />
  );
}
