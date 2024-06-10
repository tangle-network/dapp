'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import useIdealStakePercentage from '../../data/KeyStats/useIdealStakePercentage';

const IdealStakedPercentageKeyStat: FC = () => {
  const { data, isLoading, error } = useIdealStakePercentage();

  return (
    <KeyStatsItem
      title="Ideal Staked"
      tooltip="Ideal proportion of tokens staked to secure the network and sustain active token trade and usage."
      className="!border-b-0"
      suffix="%"
      showDataBeforeLoading
      isLoading={isLoading}
      error={error}
    >
      {data?.value1 ?? EMPTY_VALUE_PLACEHOLDER}
    </KeyStatsItem>
  );
};

export default IdealStakedPercentageKeyStat;
