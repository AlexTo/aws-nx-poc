import AguiProvider from './components/AguiProvider';
import { useAuth } from 'react-oidc-context';
import CognitoAuth from './components/CognitoAuth';
import Api2Provider from './components/Api2Provider';
import Api1Provider from './components/Api1Provider';
import QueryClientProvider from './components/QueryClientProvider';
import { useRuntimeConfig } from './hooks/useRuntimeConfig';
import RuntimeConfigProvider from './components/RuntimeConfig';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type RouterProviderContext = {
  runtimeConfig?: ReturnType<typeof useRuntimeConfig>;
  auth?: ReturnType<typeof useAuth>;
};

const router = createRouter({
  routeTree,
  context: { runtimeConfig: undefined, auth: undefined },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const auth = useAuth();
  const runtimeConfig = useRuntimeConfig();
  return <RouterProvider router={router} context={{ runtimeConfig, auth }} />;
};

const root = document.getElementById('root');
root &&
  createRoot(root).render(
    <React.StrictMode>
      <RuntimeConfigProvider>
        <CognitoAuth>
          <QueryClientProvider>
            <Api1Provider>
              <Api2Provider>
                <AguiProvider>
                  <App />
                </AguiProvider>
              </Api2Provider>
            </Api1Provider>
          </QueryClientProvider>
        </CognitoAuth>
      </RuntimeConfigProvider>
    </React.StrictMode>,
  );
