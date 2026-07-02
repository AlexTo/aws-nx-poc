import { Api1 } from '../generated/api1/client.gen';
import { Api1ClientContext } from '../components/Api1Provider';
import { useContext } from 'react';

export const useApi1Client = (): Api1 => {
  const client = useContext(Api1ClientContext);

  if (!client) {
    throw new Error('useApi1Client must be used within a Api1Provider');
  }

  return client;
};
