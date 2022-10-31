import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Footer } from '@webb-tools/webb-ui-components/components';

import { Header } from '../../components';
import { defaultEndpoint } from '../../constants';
import { StatsProvider } from '../../provider/stats-provider';
import { FC, useMemo, useState } from 'react';

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [connectedEndpoint, setConnectedEndpoint] = useState((): string => {
    const storedEndpoint = localStorage.getItem('statsEndpoint');
    if (storedEndpoint) {
      return storedEndpoint;
    }
    return defaultEndpoint;
  });

  const apolloClient = useMemo(() => {
    return new ApolloClient({
      cache: new InMemoryCache(),
      uri: connectedEndpoint,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fetchOptions: {
        mode: 'cors',
      },
    });
  }, [connectedEndpoint]);

  const setEndpoint = async (endpoint: string) => {
    localStorage.setItem('statsEndpoint', endpoint);
    setConnectedEndpoint(endpoint);
  };

  return (
    <div className="min-w-full min-h-full">
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
