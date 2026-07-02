import { useContext } from 'react';
import { Api1Context } from '../components/Api1Provider';
import { Api1OptionsProxy } from '../generated/api1/options-proxy.gen';

export const useApi1 = (): Api1OptionsProxy => {
  const optionsProxy = useContext(Api1Context);

  if (!optionsProxy) {
    throw new Error('useApi1 must be used within a Api1Provider');
  }

  return optionsProxy;
};
