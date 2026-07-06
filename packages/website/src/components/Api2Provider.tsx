import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { Api2 } from '../generated/api2/client.gen';
import { Api2OptionsProxy } from '../generated/api2/options-proxy.gen';
import { useRuntimeConfig } from '../hooks/useRuntimeConfig';
import { useSigV4 } from '../hooks/useSigV4';

export const Api2Context = createContext<Api2OptionsProxy | undefined>(
  undefined,
);

export const Api2ClientContext = createContext<Api2 | undefined>(undefined);

const useCreateApi2Client = (): Api2 => {
  const runtimeConfig = useRuntimeConfig();
  const apiUrl = runtimeConfig.apis.Api2;
  const sigv4Client = useSigV4();
  return useMemo(
    () =>
      new Api2({
        url: apiUrl,
        fetch: sigv4Client.fetch,
      }),
    [apiUrl, sigv4Client],
  );
};

export const Api2Provider: FC<PropsWithChildren> = ({ children }) => {
  const client = useCreateApi2Client();
  const optionsProxy = useMemo(
    () => new Api2OptionsProxy({ client }),
    [client],
  );

  return (
    <Api2ClientContext.Provider value={client}>
      <Api2Context.Provider value={optionsProxy}>
        {children}
      </Api2Context.Provider>
    </Api2ClientContext.Provider>
  );
};

export default Api2Provider;
