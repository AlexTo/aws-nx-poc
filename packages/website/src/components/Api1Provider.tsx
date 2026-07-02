import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { Api1 } from '../generated/api1/client.gen';
import { Api1OptionsProxy } from '../generated/api1/options-proxy.gen';
import { useRuntimeConfig } from '../hooks/useRuntimeConfig';

export const Api1Context = createContext<Api1OptionsProxy | undefined>(
  undefined,
);

export const Api1ClientContext = createContext<Api1 | undefined>(undefined);

const useCreateApi1Client = (): Api1 => {
  const runtimeConfig = useRuntimeConfig();
  const apiUrl = runtimeConfig.apis.Api1;
  return useMemo(
    () =>
      new Api1({
        url: apiUrl,
      }),
    [apiUrl],
  );
};

export const Api1Provider: FC<PropsWithChildren> = ({ children }) => {
  const client = useCreateApi1Client();
  const optionsProxy = useMemo(
    () => new Api1OptionsProxy({ client }),
    [client],
  );

  return (
    <Api1ClientContext.Provider value={client}>
      <Api1Context.Provider value={optionsProxy}>
        {children}
      </Api1Context.Provider>
    </Api1ClientContext.Provider>
  );
};

export default Api1Provider;
