'use client';

import { notificationApi } from '@webb-tools/webb-ui-components';
import { type FC, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { formatTokenBalance } from '../../utils/polkadot';
import { NominatorStatsItem } from '../NominatorStatsItem';

const UnbondingStatsItem: FC<{ address: string }> = ({ address }) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const { data: unbondingRemainingEras, error: unbondingRemainingErasError } =
    useUnbondingRemainingErasSubscription(address);

  const unbondingRemainingErasTooltip = useMemo(() => {
    if (unbondingRemainingErasError) {
      notificationApi({
        variant: 'error',
        message: unbondingRemainingErasError.message,
      });
    }

    if (!unbondingRemainingEras?.value1) {
      return null;
    } else if (unbondingRemainingEras.value1.length === 0) {
      return 'You have no unbonding tokens.';
    }

    const elements = unbondingRemainingEras.value1.map((era, index) => (
      <div key={index} className="text-center mb-2">
        <p>
          {era.remainingEras > 0 ? 'Unbonding' : 'Unbonded'}{' '}
          {formatTokenBalance(era.amount, nativeTokenSymbol)}
        </p>

        {era.remainingEras > 0 && <p>{era.remainingEras} eras remaining.</p>}
      </div>
    ));

    return <>{elements}</>;
  }, [
    unbondingRemainingErasError,
    unbondingRemainingEras?.value1,
    nativeTokenSymbol,
  ]);

  return (
    <NominatorStatsItem
      title={`Unbonding ${nativeTokenSymbol}`}
      tooltip={unbondingRemainingErasTooltip ?? undefined}
      isError={unbondingRemainingErasError !== null}
    >
      {unbondingRemainingEras?.value0
        ? formatTokenBalance(unbondingRemainingEras.value0, nativeTokenSymbol)
        : null}
    </NominatorStatsItem>
  );
};

export default UnbondingStatsItem;
