import { useMemo } from 'react';
import type { DelegatorInfo, RestakeAssetMap } from '../../types/restake';

const calculateDelegatorTVL = (
  delegatorInfo: DelegatorInfo,
  assetMap: RestakeAssetMap,
) => {
  const delegatorTVL: Record<string, number> = {};

  for (const delegation of delegatorInfo.delegations) {
    const asset = assetMap.get(delegation.assetId);

    if (asset === undefined) {
      delegatorTVL[delegation.assetId] = 0;

      continue;
    }

    const value =
      asset.metadata.priceInUsd === null
        ? 0
        : Number(delegation.amountBonded * BigInt(asset.metadata.priceInUsd));

    delegatorTVL[delegation.assetId] =
      (delegatorTVL[delegation.assetId] || 0) + value;
  }

  const totalDelegatorTVL = Object.values(delegatorTVL).reduce(
    (sum, tvl) => sum + tvl,
    0,
  );
  return { delegatorTVL, totalDelegatorTVL };
};

export function useDelegatorTVL(
  delegatorInfo: DelegatorInfo | null,
  assetMap: RestakeAssetMap | null,
) {
  return useMemo(() => {
    if (delegatorInfo === null || assetMap === null) {
      return { delegatorTVL: {}, totalDelegatorTVL: 0 };
    }

    return calculateDelegatorTVL(delegatorInfo, assetMap);
  }, [delegatorInfo, assetMap]);
}
