'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import useActiveAndDelegationCountSubscription from '../../data/KeyStats/useActiveAndDelegationCountSubscription';

const ActiveValidatorsKeyStat: FC = () => {
  const { data, isLoading, error } = useActiveAndDelegationCountSubscription();

  return (
    <KeyStatsItem
      title="Active/Nomination"
      tooltip="Current active nominators out of the total possible."
      isLoading={isLoading}
      error={error}
    >
      {data?.value1}/{data?.value2}
    </KeyStatsItem>
  );
};

export default ActiveValidatorsKeyStat;
