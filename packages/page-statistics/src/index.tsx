
import React, { FC } from 'react';
import styled from 'styled-components';
import { StatisticsOverview } from './StatisticsOverview';
import { DepositStatistics } from './DepositStatistics';
import { WithdrawalStatistics } from './WithdrawalStatistics';
import { RelayersStatistics } from './RelayerStatistics';
import { DKGStatistics } from './DKGStatistics';

type StatisticsPageProps = {
  view: string
};

const PageStatistics: FC<StatisticsPageProps> = ({view}) => {

  if (view === 'overview') {
    return (
      <StatisticsOverview/>
    )
  } else if (view === 'deposits') {
    return (
      <DepositStatistics/>
    )
  } else if (view === 'withdrawals') {
    return (
      <WithdrawalStatistics/>
    )
  } else if (view === 'relayers') {
    return (
      <RelayersStatistics/>
    )
  } else if (view === 'dkg') {
    return (
      <DKGStatistics/>
    )
  } else {
    return (
      <StatisticsOverview/>
    )
  }
};

export default PageStatistics;
