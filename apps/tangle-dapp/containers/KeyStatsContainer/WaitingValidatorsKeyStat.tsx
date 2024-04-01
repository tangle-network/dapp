'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import useWaitingCountSubscription from '../../data/KeyStats/useWaitingCountSubscription';

const WaitingValidatorsKeyStat: FC = () => {
  const { data, error, isLoading } = useWaitingCountSubscription();

  return (
    <KeyStatsItem
      title="Waiting"
      tooltip="Nodes waiting in line to become active validators."
      className="!border-r-0 lg:!border-r lg:!border-b-0"
      error={error}
      isLoading={isLoading}
    >
      {data?.value1}
    </KeyStatsItem>
  );
};

export default WaitingValidatorsKeyStat;
