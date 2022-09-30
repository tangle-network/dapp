// The ApolloClient and Stats Provider surround the
import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Footer, Header } from '@webb-dapp/page-statistics/components';
import { StatsProvider } from '@webb-dapp/page-statistics/provider/stats-provider';
import { FC, useMemo, useState } from 'react';

const availableEndpoints = ['http://localhost:4000', 'https://subquery-dev.webb.tools/graphql'];

const isDev = process.env.NODE_ENV === 'development';

localStorage.getItem('stats-endpoint');

export const Layout: FC = ({ children }) => {
  const [connectedEndpoint, setConnectedEndpoint] = useState(
    localStorage.getItem('stats-endpoint') ?? 'http://localhost:4000'
  );

  const apolloClient = useMemo(() => {
    return new ApolloClient({
      cache: new InMemoryCache(),
      uri: connectedEndpoint,
    });
  }, [connectedEndpoint]);

  return (
    <div className='min-w-full min-h-full'>
      <Header
        initialEndpoint={connectedEndpoint}
        availableEndpoints={availableEndpoints}
        setConnectedEndpoint={setConnectedEndpoint}
      />
      <ApolloProvider client={apolloClient}>
        <StatsProvider blockTime={6} sessionHeight={600}>
          <main className='max-w-[1160px] mx-auto'>{children}</main>
        </StatsProvider>
      </ApolloProvider>
      <Footer />
    </div>
  );
};
