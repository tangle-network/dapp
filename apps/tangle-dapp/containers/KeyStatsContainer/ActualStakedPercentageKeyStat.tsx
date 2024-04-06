'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import useActualStakedPercentage from '../../data/staking/useActualStakedPercentage';

const ActualStakedPercentageKeyStat: FC = () => {
  const actualStakedPercentage = useActualStakedPercentage();

  const roundedActualStakedPercentage =
    actualStakedPercentage === null
      ? null
      : // Round to 2 decimal places.
        Math.round(actualStakedPercentage * 100 * 100) / 100;

  return (
    <KeyStatsItem
      title="Actual Staked"
      tooltip="The % of all network tokens that have been staked in the current era."
      className="!border-r-0 lg:!border-r  lg:!border-b-0"
      suffix="%"
      isLoading={roundedActualStakedPercentage === null}
      error={null}
    >
      {roundedActualStakedPercentage !== null
        ? roundedActualStakedPercentage
        : undefined}
    </KeyStatsItem>
  );
};

export default ActualStakedPercentageKeyStat;
