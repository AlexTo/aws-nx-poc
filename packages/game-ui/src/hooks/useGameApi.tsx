import { useContext } from 'react';
import {
  GameApiTRPCContext,
  type GameApiTRPCContextValue,
} from '../components/GameApiClientProvider';

export const useGameApi = (): GameApiTRPCContextValue['optionsProxy'] => {
  const container = useContext(GameApiTRPCContext);
  if (!container) {
    throw new Error('useGameApi must be used within GameApiClientProvider');
  }
  return container.optionsProxy;
};

export const useGameApiClient = (): GameApiTRPCContextValue['client'] => {
  const container = useContext(GameApiTRPCContext);
  if (!container) {
    throw new Error(
      'useGameApiClient must be used within GameApiClientProvider',
    );
  }
  return container.client;
};
