'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import useInflationPercentage from '../../data/KeyStats/useInflationPercentage';

const InflationPercentageKeyStat: FC = () => {
  const { data, isLoading, error } = useInflationPercentage();

  return (
    <KeyStatsItem
      title="Inflation"
      tooltip="The yearly % increase in the network’s total token supply."
      className="!border-b-0 !border-r-0"
      suffix="%"
      isLoading={isLoading}
      error={error}
    >
      {data?.value1}
    </KeyStatsItem>
  );
};

export default InflationPercentageKeyStat;
