import { createTRPCClient, httpLink, HTTPLinkOptions } from '@trpc/client';
import { AppRouter } from '../router.js';

export interface ApiClientConfig {
  readonly url: string;
}

export const createApiClient = (config: ApiClientConfig) => {
  const linkOptions: HTTPLinkOptions<any> = {
    url: config.url,
  };
  return createTRPCClient<AppRouter>({
    links: [httpLink(linkOptions)],
  });
};
