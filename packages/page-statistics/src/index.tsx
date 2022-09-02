import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import React, { FC } from 'react';

import { DepositStatistics } from './DepositStatistics';
import { DKGStatistics } from './DKGStatistics';
import { RelayersStatistics } from './RelayerStatistics';
import { StatisticsOverview } from './StatisticsOverview';
import { WithdrawalStatistics } from './WithdrawalStatistics';

type StatisticsPageProps = {
  view: 'overview' | 'deposits' | 'withdrawals' | 'relayers' | 'dkg' | 'dkg-eggnet';
};

const PageStatistics: FC<StatisticsPageProps> = ({ view }) => {
  switch (view) {
    case 'overview':
      return <StatisticsOverview />;

    case 'deposits':
      return <DepositStatistics />;

    case 'withdrawals':
      return <WithdrawalStatistics />;

    case 'relayers':
      return <RelayersStatistics />;

    case 'dkg':
      return <DKGStatistics />;

    default:
      return <StatisticsOverview />;
  }
};
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:3000',
});

const Page: FC<StatisticsPageProps> = (props) => {
  return (
    <ApolloProvider client={apolloClient}>
      <PageStatistics {...props} />
    </ApolloProvider>
  );
};

export default Page;
