import { useContext } from 'react';
import {
  TrpcTRPCContext,
  type TrpcTRPCContextValue,
} from '../components/TrpcClientProvider';

export const useTrpc = (): TrpcTRPCContextValue['optionsProxy'] => {
  const container = useContext(TrpcTRPCContext);
  if (!container) {
    throw new Error('useTrpc must be used within TrpcClientProvider');
  }
  return container.optionsProxy;
};

export const useTrpcClient = (): TrpcTRPCContextValue['client'] => {
  const container = useContext(TrpcTRPCContext);
  if (!container) {
    throw new Error('useTrpcClient must be used within TrpcClientProvider');
  }
  return container.client;
};
