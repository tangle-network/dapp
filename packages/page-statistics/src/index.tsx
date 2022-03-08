import React, { FC } from 'react';
import styled from 'styled-components';

import { DepositStatistics } from './DepositStatistics';
import { DKGStatistics } from './DKGStatistics';
import { RelayersStatistics } from './RelayerStatistics';
import { StatisticsOverview } from './StatisticsOverview';
import { WithdrawalStatistics } from './WithdrawalStatistics';

type StatisticsPageProps = {
  view: string;
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
  } else {
    return <StatisticsOverview />;
  }
};

export default PageStatistics;
