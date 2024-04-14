'use client';

import { type FC, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useUnbondingAmount from '../../data/NominatorStats/useUnbondingAmount';
import useUnbonding from '../../data/staking/useUnbonding';
import { formatBnWithCommas } from '../../utils/formatBnWithCommas';
import { formatTokenBalance } from '../../utils/polkadot';
import { NominatorStatsItem } from '../NominatorStatsItem';

const UnbondingStatsItem: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();

  const { result: unbondingEntriesOpt, error: unbondingEntriesError } =
    useUnbonding();

  const { result: totalUnbondingAmount, error: unbondingAmountError } =
    useUnbondingAmount();

  const unbondingRemainingErasTooltip = useMemo(() => {
    if (unbondingEntriesOpt === null) {
      return null;
    } else if (
      unbondingEntriesOpt.value === null ||
      unbondingEntriesOpt.value.length === 0
    ) {
      return 'You have no unbonding tokens.';
    }

    const elements = unbondingEntriesOpt.value.map((entry, index) => {
      return (
        <div key={index} className="text-center mb-2">
          <p>
            {entry.remainingEras.gtn(0) ? 'Unbonding' : 'Unbonded'}{' '}
            {formatTokenBalance(entry.amount, nativeTokenSymbol)}
          </p>

          {entry.remainingEras.gtn(0) && (
            <p>{formatBnWithCommas(entry.remainingEras)} eras remaining.</p>
          )}
        </div>
      );
    });

    return <>{elements}</>;
  }, [unbondingEntriesOpt, nativeTokenSymbol]);

  return (
    <NominatorStatsItem
      title={`Unbonding ${nativeTokenSymbol}`}
      tooltip={unbondingRemainingErasTooltip ?? undefined}
      isError={unbondingEntriesError !== null || unbondingAmountError !== null}
    >
      {totalUnbondingAmount?.value
        ? formatTokenBalance(totalUnbondingAmount?.value, nativeTokenSymbol)
        : null}
    </NominatorStatsItem>
  );
};

export default UnbondingStatsItem;
