'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import useActualStakedPercentage from '../../data/staking/useActualStakedPercentage';

const ActualStakedPercentageKeyStat: FC = () => {
  const actualStakedPercentage = useActualStakedPercentage();

  return (
    <KeyStatsItem
      title="Actual Staked"
      tooltip="The actual percentage of all network tokens that have been staked in the current era."
      className="!border-r-0 lg:!border-r  lg:!border-b-0"
      suffix="%"
      isLoading={actualStakedPercentage === null}
      error={null}
    >
      {actualStakedPercentage !== null
        ? actualStakedPercentage * 100
        : undefined}
    </KeyStatsItem>
  );
};

export default ActualStakedPercentageKeyStat;
