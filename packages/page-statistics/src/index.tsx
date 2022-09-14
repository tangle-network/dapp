import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { KeygenTable } from '@webb-dapp/webb-ui-components';
import React, { FC } from 'react';

type StatisticsPageProps = {
  view: 'overview' | 'deposits' | 'withdrawals' | 'relayers' | 'dkg' | 'dkg-eggnet';
};

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:4000',
});

const Page: FC<StatisticsPageProps> = (props) => {
  return (
    <ApolloProvider client={apolloClient}>
      <div>
        <KeygenTable />
      </div>
    </ApolloProvider>
  );
};

export default Page;
