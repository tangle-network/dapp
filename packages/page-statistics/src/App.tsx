import { ApolloClient, InMemoryCache } from '@apollo/client';
import { FC } from 'react';

import { DepositStatistics } from './DepositStatistics';
import { RelayersStatistics } from './RelayerStatistics';
import { StatisticsOverview } from './StatisticsOverview';
import { WithdrawalStatistics } from './WithdrawalStatistics';

type StatisticsPageProps = {
  view?: 'overview' | 'deposits' | 'withdrawals' | 'relayers' | 'dkg' | 'dkg-eggnet';
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

    default:
      return <StatisticsOverview />;
  }
};
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:4000',
});

const App: FC = () => {
  return <div>Hello world</div>;
};

export default App;
