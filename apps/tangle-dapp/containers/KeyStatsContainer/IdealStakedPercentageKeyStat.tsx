'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import useIdealStakePercentage from '../../data/KeyStats/useIdealStakePercentage';

const IdealStakedPercentageKeyStat: FC = () => {
  const { data, isLoading, error } = useIdealStakePercentage();

  return (
    <KeyStatsItem
      title="Ideal Staked"
      tooltip="The ideal % of all network tokens that should be staked."
      className="!border-b-0"
      suffix="%"
      isLoading={isLoading}
      error={error}
    >
      {data?.value1}
    </KeyStatsItem>
  );
};

export default IdealStakedPercentageKeyStat;
