import { createTRPCClient, httpLink, HTTPLinkOptions } from '@trpc/client';
import { AppRouter } from '../router.js';

export interface TrpcClientConfig {
  readonly url: string;
}

export const createTrpcClient = (config: TrpcClientConfig) => {
  const linkOptions: HTTPLinkOptions<any> = {
    url: config.url,
  };
  return createTRPCClient<AppRouter>({
    links: [httpLink(linkOptions)],
  });
};
