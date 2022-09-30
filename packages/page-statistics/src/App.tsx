import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { StatsProvider } from '@webb-dapp/page-statistics/provider/stats-provider';
import { RouterProvider } from '@webb-dapp/react-environment/RouterProvider';
import { WebbUIProvider } from '@webb-dapp/webb-ui-components/provider';
import { FC } from 'react';

import { routes } from './routes';

const isDev = process.env.NODE_ENV === 'development';
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: isDev ? 'http://localhost:4000' : 'https://subquery-dev.webb.tools/graphql',
});
const App: FC = () => {
  return (
    <WebbUIProvider hasErrorBoudary>
      <ApolloProvider client={apolloClient}>
        <StatsProvider blockTime={6} sessionHeight={600}>
          <RouterProvider config={routes} />
        </StatsProvider>
      </ApolloProvider>
    </WebbUIProvider>
  );
};

export default App;
