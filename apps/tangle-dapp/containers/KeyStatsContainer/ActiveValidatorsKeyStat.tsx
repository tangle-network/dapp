'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import useActiveAndDelegationCountSubscription from '../../data/KeyStats/useActiveAndDelegationCountSubscription';

const ActiveValidatorsKeyStat: FC = () => {
  const { data, isLoading, error } = useActiveAndDelegationCountSubscription();

  return (
    <KeyStatsItem
      title="Active/Nomination"
      tooltip="Current active nominators out of the total possible."
      showDataBeforeLoading
      isLoading={isLoading}
      error={error}
    >
      {data?.value1 ?? EMPTY_VALUE_PLACEHOLDER}/
      {data?.value2 ?? EMPTY_VALUE_PLACEHOLDER}
    </KeyStatsItem>
  );
};

export default ActiveValidatorsKeyStat;
