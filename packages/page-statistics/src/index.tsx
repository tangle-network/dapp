import React, { FC } from 'react';
import styled from 'styled-components';

import { DepositStatistics } from './DepositStatistics';
import { DKGEggnetStatistics } from './DKGEggnetStatistics';
import { DKGStatistics } from './DKGStatistics';
import { RelayersStatistics } from './RelayerStatistics';
import { StatisticsOverview } from './StatisticsOverview';
import { WithdrawalStatistics } from './WithdrawalStatistics';

type StatisticsPageProps = {
  view: 'overview' | 'deposits' | 'withdrawals' | 'relayers' | 'dkg' | 'dkg-eggnet';
};

const PageStatistics: FC<StatisticsPageProps> = ({ view }) => {
  if (view === 'overview') {
    return <StatisticsOverview />;
  } else if (view === 'deposits') {
    return <DepositStatistics />;
  } else if (view === 'withdrawals') {
    return <WithdrawalStatistics />;
  } else if (view === 'relayers') {
    return <RelayersStatistics />;
  } else if (view === 'dkg') {
    return <DKGStatistics />;
  } else if (view === 'dkg-eggnet') {
    return <DKGEggnetStatistics />;
  } else {
    return <StatisticsOverview />;
  }
};

export default PageStatistics;
