import {
  ApolloClient,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Header } from '@webb-tools/stats-dapp/components';
import { defaultEndpoint } from '@webb-tools/stats-dapp/constants';
import { StatsProvider } from '@webb-tools/stats-dapp/provider/stats-provider';
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const [connectedEndpoint, setConnectedEndpoint] = useState((): string => {
    const storedEndpoint = localStorage.getItem('statsEndpoint');
    if (storedEndpoint) {
      return storedEndpoint;
    }
    return defaultEndpoint;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apolloClient = useMemo(() => {
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ locations, message, path }) =>
          setErrorMessage(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }
      if (networkError) {
        setErrorMessage(`[Network error]: ${networkError}`);
      }
    });
    const httpLink = new HttpLink({
      uri: connectedEndpoint,
    });
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([errorLink, httpLink]),
    });
  }, [connectedEndpoint, setErrorMessage]);

  const setEndpoint = async (endpoint: string) => {
    localStorage.setItem('statsEndpoint', endpoint);
    setConnectedEndpoint(endpoint);
  };

  return (
    <div className="min-w-full min-h-full">
      <div
        onClick={() => {
          setErrorMessage(null);
        }}
      >
        {errorMessage}
      </div>
      <Header
        connectedEndpoint={connectedEndpoint}
        setConnectedEndpoint={setEndpoint}
      />
      <ApolloProvider client={apolloClient}>
        <StatsProvider blockTime={6} sessionHeight={600}>
          <main className="max-w-[1160px] mx-auto">{children}</main>
        </StatsProvider>
      </ApolloProvider>
      <Footer />
    </div>
  );
};
