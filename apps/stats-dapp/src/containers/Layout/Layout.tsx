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
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Footer, useWebbUI } from '@webb-tools/webb-ui-components';
import { RetryLink } from '@apollo/client/link/retry';
import { NavBoxInfoContainer } from '../NavBlocksInfoContainer';
import {
  webbNetworks,
  Network,
  NetworkType,
} from '@webb-tools/webb-ui-components/constants';
import { isValidSubqueryEndpoint } from '../../utils';

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { notificationApi } = useWebbUI();

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

  const [selectedNetworkType, setSelectedNetworkType] =
    useState<NetworkType>('testnet');

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
      uri: selectedNetwork.subqueryEndpoint,
    });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([errorLink, retryLink, httpLink]),
    });
  }, [selectedNetwork, setErrorMessage]);

  const setUserSelectedNetwork = async (network: Network) => {
    const handleSuccess = () => {
      notificationApi({
        variant: 'success',
        message: `Connected to ${network.name}`,
      });
      localStorage.setItem('selectedNetwork', JSON.stringify(network));
      setSelectedNetwork(network);
    };

    const handleClose = () => {
      notificationApi({
        variant: 'error',
        message: `Please make sure you have a running node at the selected network.`,
      });
      localStorage.setItem(
        'selectedNetwork',
        JSON.stringify(defaultNetworkType[0].networks[0])
      );
      setSelectedNetwork(defaultNetworkType[0].networks[0]);
    };

    try {
      if (await isValidSubqueryEndpoint(network.subqueryEndpoint)) {
        const ws = new WebSocket(network.polkadotEndpoint);

        const handleOpen = () => {
          handleSuccess();
          ws.removeEventListener('open', handleOpen);
        };

        const handleCloseEvent = () => {
          handleClose();
          ws.removeEventListener('close', handleCloseEvent);
        };

        ws.addEventListener('open', handleOpen);
        ws.addEventListener('close', handleCloseEvent);
      } else {
        handleClose();
      }
    } catch (error) {
      handleClose();
    }
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
    <>
      <div className="min-w-full min-h-full pb-8 bg-[url('assets/swirl-light.png')] dark:bg-[url('assets/swirl-dark.png')]">
        <Header
          selectedNetwork={selectedNetwork}
          setUserSelectedNetwork={setUserSelectedNetwork}
          selectedNetworkType={selectedNetworkType}
          setSelectedNetworkType={setSelectedNetworkType}
        />

        <ApolloProvider client={apolloClient}>
          <StatsProvider
            subqueryEndpoint={subqueryEndpoint}
            polkadotEndpoint={polkadotEndpoint}
          >
            <NavBoxInfoContainer />
            <main className="max-w-[1160px] mx-auto">{children}</main>
          </StatsProvider>
        </ApolloProvider>
      </div>
      <Footer />
    </>
  );
};
