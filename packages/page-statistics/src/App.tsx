import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { StatsProvider } from '@webb-dapp/page-statistics/provider/stats-provider';
import { RouterProvider } from '@webb-dapp/react-environment/RouterProvider';
import { WebbUIProvider } from '@webb-dapp/webb-ui-components/provider';
import { FC } from 'react';

import { encodeAddress } from '@polkadot/util-crypto';

import { routes } from './routes';

const isDev = process.env.NODE_ENV === 'development';
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: isDev ? 'http://localhost:4000' : 'https://api.subquery.network/sq/AtelyPham/webb-subql',
});
console.log(encodeAddress(`0x69a1e29c03787e72adbd6fc93195376051d974bb545b2a5f42d834e0a0adfb83`));
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
