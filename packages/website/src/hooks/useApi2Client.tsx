import { Api2 } from '../generated/api2/client.gen';
import { Api2ClientContext } from '../components/Api2Provider';
import { useContext } from 'react';

export const useApi2Client = (): Api2 => {
  const client = useContext(Api2ClientContext);

  if (!client) {
    throw new Error('useApi2Client must be used within a Api2Provider');
  }

  return client;
};
