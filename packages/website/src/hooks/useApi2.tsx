import { useContext } from 'react';
import { Api2Context } from '../components/Api2Provider';
import { Api2OptionsProxy } from '../generated/api2/options-proxy.gen';

export const useApi2 = (): Api2OptionsProxy => {
  const optionsProxy = useContext(Api2Context);

  if (!optionsProxy) {
    throw new Error('useApi2 must be used within a Api2Provider');
  }

  return optionsProxy;
};
