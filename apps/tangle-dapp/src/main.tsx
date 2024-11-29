import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PolkadotApiProvider } from '@webb-tools/tangle-shared-ui/context/PolkadotApiContext';
import { Layout } from './layout';
import App from './App';
import '@webb-tools/webb-ui-components/tailwind.css';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PolkadotApiProvider>
        <BrowserRouter>
          <Layout>
            <App />
          </Layout>
        </BrowserRouter>
      </PolkadotApiProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
