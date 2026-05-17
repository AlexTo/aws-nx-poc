import TrpcClientProvider from './components/TrpcClientProvider';
import QueryClientProvider from './components/QueryClientProvider';
import { useRuntimeConfig } from './hooks/useRuntimeConfig';
import RuntimeConfigProvider from './components/RuntimeConfig';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './styles.css';

export type RouterProviderContext = {
  runtimeConfig?: ReturnType<typeof useRuntimeConfig>;
};

const router = createRouter({
  routeTree,
  context: { runtimeConfig: undefined },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const runtimeConfig = useRuntimeConfig();
  return <RouterProvider router={router} context={{ runtimeConfig }} />;
};

const root = document.getElementById('root');
root &&
  createRoot(root).render(
    <React.StrictMode>
      <RuntimeConfigProvider>
        <QueryClientProvider>
          <TrpcClientProvider>
            <App />
          </TrpcClientProvider>
        </QueryClientProvider>
      </RuntimeConfigProvider>
    </React.StrictMode>,
  );
