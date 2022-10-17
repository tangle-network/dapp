import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Footer, Header } from '@webb-dapp/page-statistics/components';
import { defaultEndpoint } from '@webb-dapp/page-statistics/constants';
import { StatsProvider } from '@webb-dapp/page-statistics/provider/stats-provider';
import { FC, useMemo, useState } from 'react';

export const Layout: FC = ({ children }) => {
  const [connectedEndpoint, setConnectedEndpoint] = useState((): string => {
    const storedEndpoint = localStorage.getItem('statsEndpoint');
    if (storedEndpoint) {
      return storedEndpoint;
    }
    return defaultEndpoint;
  });

  const apolloClient = useMemo(() => {
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ locations, message, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    });
    const httpLink = new HttpLink({
      uri: connectedEndpoint,
    });
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([errorLink, httpLink]),
    });
  }, [connectedEndpoint]);

  const setEndpoint = async (endpoint: string) => {
    localStorage.setItem('statsEndpoint', endpoint);
    setConnectedEndpoint(endpoint);
  };

  return (
    <div className='min-w-full min-h-full'>
      <Header connectedEndpoint={connectedEndpoint} setConnectedEndpoint={setEndpoint} />
      <ApolloProvider client={apolloClient}>
        <StatsProvider blockTime={6} sessionHeight={600}>
          <main className='max-w-[1160px] mx-auto'>{children}</main>
        </StatsProvider>
      </ApolloProvider>
      <Footer />
    </div>
  );
};
