import React, { FC } from 'react';
import styled from 'styled-components';

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

export default PageStatistics;
