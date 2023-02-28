import {
  ApolloClient,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Header } from '../../components';
import { StatsProvider } from '../../provider';
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';
import { RetryLink } from '@apollo/client/link/retry';
import { NavBoxInfoContainer } from '../NavBlocksInfoContainer';
import {
  webbNetworks,
  Network,
} from '@webb-tools/webb-ui-components/constants';

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const defaultNetworkType = webbNetworks.filter(
    (network) => network.networkType === 'testnet'
  );

  const [selectedNetwork, setSelectedNetwork] = useState((): Network => {
    const storedSelectedNetwork = localStorage.getItem('selectedNetwork');

    if (storedSelectedNetwork) {
      return JSON.parse(storedSelectedNetwork);
    }

    return defaultNetworkType[0].networks[0];
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const retryLink = new RetryLink({
    delay: () => {
      return 0;
    },
    attempts: () => {
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
      uri: selectedNetwork.subqueryEndpoint, // subqueryEndpoint - graphql endpoint,
    });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([errorLink, retryLink, httpLink]),
    });
  }, [selectedNetwork, setErrorMessage]);

  const setUserSelectedNetwork = async (network: Network) => {
    localStorage.setItem('selectedNetwork', JSON.stringify(network));

    setSelectedNetwork(network);
  };

  const subqueryEndpoint = useMemo(
    () => selectedNetwork.subqueryEndpoint,
    [selectedNetwork]
  );
  const polkadotEndpoint = useMemo(
    () => selectedNetwork.polkadotEndpoint,
    [selectedNetwork]
  );

  return (
    <div className="min-w-full min-h-full">
      <Header
        selectedNetwork={selectedNetwork}
        setUserSelectedNetwork={setUserSelectedNetwork}
      />

      <ApolloProvider client={apolloClient}>
        <StatsProvider
          sessionHeight={600}
          subqueryEndpoint={subqueryEndpoint}
          polkadotEndpoint={polkadotEndpoint}
        >
          <NavBoxInfoContainer />
          <main className="max-w-[1160px] mx-auto">{children}</main>
        </StatsProvider>
      </ApolloProvider>
      <Footer />
    </div>
  );
};
