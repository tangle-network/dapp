'use client';

import { notificationApi } from '@webb-tools/webb-ui-components';
import { type FC, Fragment, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useUnbondingRemainingErasSubscription from '../../data/NominatorStats/useUnbondingRemainingErasSubscription';
import { formatTokenBalance } from '../../utils/polkadot';
import { NominatorStatsItem } from '../NominatorStatsItem';

const UnbondingStatsItem: FC<{ address: string }> = ({ address }) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const {
    data: unbondingRemainingErasData,
    error: unbondingRemainingErasError,
  } = useUnbondingRemainingErasSubscription(address);

  const unbondingRemainingErasTooltip = useMemo(() => {
    if (unbondingRemainingErasError) {
      notificationApi({
        variant: 'error',
        message: unbondingRemainingErasError.message,
      });
    }

    if (!unbondingRemainingErasData?.value1) return null;

    if (unbondingRemainingErasData.value1.length === 0) {
      return 'You have no unbonding tokens.';
    }

    const elements = unbondingRemainingErasData.value1.map((era, index) => {
      return (
        <Fragment key={index}>
          <div className="text-center mb-2">
            <p>
              {era.remainingEras > 0 ? 'Unbonding' : 'Unbonded'}{' '}
              {formatTokenBalance(era.amount, nativeTokenSymbol)}
            </p>
            {era.remainingEras > 0 && <p>{era.remainingEras} eras remaining</p>}
          </div>
        </Fragment>
      );
    });

    return <>{elements}</>;
  }, [
    unbondingRemainingErasError,
    unbondingRemainingErasData?.value1,
    nativeTokenSymbol,
  ]);

  return (
    <NominatorStatsItem
      title={`Unbonding ${nativeTokenSymbol}`}
      tooltip={unbondingRemainingErasTooltip}
      type="Unbonding Amount"
      address={address}
    />
  );
};

export default UnbondingStatsItem;
