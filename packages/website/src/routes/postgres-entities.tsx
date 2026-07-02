import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import EntitiesTable from '../components/EntitiesTable';
import { useApi1 } from '../hooks/useApi1';

export const Route = createFileRoute('/postgres-entities')({
  component: RouteComponent,
});

function RouteComponent() {
  const api1 = useApi1();
  const queryClient = useQueryClient();

  const { data: examples, isLoading, isError } = useQuery(
    api1.listExamples.queryOptions(),
  );

  const { mutateAsync: addExample, isPending: isAdding, isError: isAddError } =
    useMutation(
      api1.addExample.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(api1.listExamples.queryFilter());
        },
      }),
    );

  const {
    mutate: deleteExample,
    isPending: isDeleting,
    variables: deletingRequest,
  } = useMutation(
    api1.deleteExample.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(api1.listExamples.queryFilter());
      },
    }),
  );

  return (
    <EntitiesTable
      title="Postgres Entities"
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
