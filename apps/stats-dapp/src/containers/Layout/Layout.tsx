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
import { RetryLink } from '@apollo/client/link/retry';
import { NavBoxInfoContainer } from '../NavBlocksInfoContainer';
export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const [connectedEndpoint, setConnectedEndpoint] = useState((): string => {
    const storedEndpoint = localStorage.getItem('statsEndpoint');
    if (storedEndpoint) {
      return storedEndpoint;
    }
    return defaultEndpoint;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const retryLink = new RetryLink({
    delay: () => {
      console.log('retryLink');
      return 0;
    },
    attempts: () => {
      console.log('Should attempt');
      return Promise.resolve(true);
    },
  });
  const apolloClient = useMemo(() => {
    const errorLink = onError(
      ({ graphQLErrors, networkError, forward, operation }) => {
        if (graphQLErrors) {
          graphQLErrors.forEach(({ locations, message, path }) => {
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
            setErrorMessage(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
          });
          return forward(operation);
        }
        if (networkError) {
          console.log(`[Network error]: ${networkError}`);
          setErrorMessage(`[Network error]: ${networkError}`);
        }
      }
    );
    const httpLink = new HttpLink({
      uri: connectedEndpoint,
    });
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([errorLink, retryLink, httpLink]),
    });
  }, [connectedEndpoint, setErrorMessage]);

  const setEndpoint = async (endpoint: string) => {
    localStorage.setItem('statsEndpoint', endpoint);
    setConnectedEndpoint(endpoint);
  };

  return (
    <div className="min-w-full min-h-full">
      {/*TODO Register a notification*/}
      {/* <div
        onClick={() => {
          setErrorMessage(null);
        }}
      >
        {errorMessage}
      </div>*/}
      <Header
        connectedEndpoint={connectedEndpoint}
        setConnectedEndpoint={setEndpoint}
      />

      <ApolloProvider client={apolloClient}>
        <StatsProvider
          blockTime={6}
          sessionHeight={600}
          connectedEndpoint={connectedEndpoint}
        >
          <NavBoxInfoContainer />
          <main className="max-w-[1160px] mx-auto">{children}</main>
        </StatsProvider>
      </ApolloProvider>
      <Footer />
    </div>
  );
};
