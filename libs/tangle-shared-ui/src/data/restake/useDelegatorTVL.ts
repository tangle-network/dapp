import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';
import type { RestakeAssetMap, DelegatorInfo } from '../../types/restake';
import { useMemo } from 'react';

const calculateDelegatorTvl = (
  delegatorInfo: DelegatorInfo,
  assetMap: RestakeAssetMap,
) => {
  const delegatorTvl: Record<string, number> = {};

  for (const delegation of delegatorInfo.delegations) {
    const asset = assetMap.get(delegation.assetId);

    if (asset === undefined) {
      delegatorTvl[delegation.assetId] = 0;

      continue;
    }

    const value =
      asset.metadata.priceInUsd === null
        ? 0
        : Number(delegation.amountBonded * BigInt(asset.metadata.priceInUsd));

    delegatorTvl[delegation.assetId] =
      (delegatorTvl[delegation.assetId] || 0) + value;
  }

  const totalDelegatorTvl = Object.values(delegatorTvl).reduce(
    (sum, tvl) => sum + tvl,
    0,
  );

  return { delegatorTvl, totalDelegatorTvl };
};

const useDelegatorTvl = (
  delegatorInfo: DelegatorInfo | null,
  assetMap: RestakeAssetMap | null,
) => {
  return useMemo(() => {
    if (delegatorInfo === null || assetMap === null) {
      return { delegatorTvl: {}, totalDelegatorTvl: 0 };
    }

    return calculateDelegatorTvl(delegatorInfo, assetMap);
  }, [delegatorInfo, assetMap]);
};
