import { AppRouter } from ':aws-nx-poc/trpc';
import { useQueryClient } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { useRuntimeConfig } from '../hooks/useRuntimeConfig';
import {
  TRPCClient,
  createTRPCClient,
  httpLink,
  httpSubscriptionLink,
  splitLink,
} from '@trpc/client';

export interface TrpcTRPCContextValue {
  optionsProxy: ReturnType<typeof createTRPCOptionsProxy<AppRouter>>;
  client: TRPCClient<AppRouter>;
}

export const TrpcTRPCContext = createContext<TrpcTRPCContextValue | null>(null);

export const TrpcClientProvider: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();
  const runtimeConfig = useRuntimeConfig();
  const apiUrl = runtimeConfig.apis.Trpc;

  const container = useMemo<TrpcTRPCContextValue>(() => {
    const client = createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: apiUrl,
          }),
          false: httpLink({
            url: apiUrl,
          }),
        }),
      ],
    });

    const optionsProxy = createTRPCOptionsProxy<AppRouter>({
      client,
      queryClient,
    });

    return { optionsProxy, client };
  }, [apiUrl, queryClient]);

  return (
    <TrpcTRPCContext.Provider value={container}>
      {children}
    </TrpcTRPCContext.Provider>
  );
};

export default TrpcClientProvider;
