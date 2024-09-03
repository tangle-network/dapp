import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';

import { useRestakeContext } from '../../context/RestakeContext';
import type { DelegatorInfo, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';

export default function useRestakeTVL(
  operatorMap: OperatorMap,
  delegatorInfo: DelegatorInfo | null,
) {
  const { assetMap } = useRestakeContext();

  const tvl$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([operatorMap, delegatorInfo, assetMap]) => {
          const { operatorTVL, poolTVL } = Object.entries(operatorMap).reduce(
            (acc, [operatorId, operatorData]) => {
              const operatorTVL = operatorData.delegations.reduce(
                (sum, delegation) => {
                  const asset = assetMap[delegation.assetId];
                  const assetPrice = asset?.priceInUsd ?? null;

                  if (typeof assetPrice !== 'number') {
                    return sum;
                  }

                  const result = safeFormatUnits(
                    delegation.amount,
                    asset.decimals,
                  );

                  if (!result.sucess) {
                    return sum;
                  }

                  const formattedAmount = Number(result.value);

                  // Calculate operator TVL
                  sum += formattedAmount * assetPrice;

                  // Calculate pool TVL
                  const poolId = asset.poolId;
                  if (poolId !== null) {
                    acc.poolTVL[poolId] =
                      (acc.poolTVL[poolId] || 0) + formattedAmount * assetPrice;
                  }

                  return sum;
                },
                0,
              );

              acc.operatorTVL[operatorId] = operatorTVL;
              return acc;
            },
            {
              operatorTVL: {} as Record<string, number>,
              poolTVL: {} as Record<string, number>,
            },
          );

          const totalNetworkTVL = Object.values(poolTVL).reduce(
            (sum, tvl) => sum + tvl,
            0,
          );

          const operatorConcentration = Object.entries(operatorTVL).reduce(
            (acc, [operatorId, operatorTVL]) => {
              acc[operatorId] =
                totalNetworkTVL > 0
                  ? (operatorTVL / totalNetworkTVL) * 100
                  : null;
              return acc;
            },
            {} as Record<string, number | null>,
          );

          const delegatorTVL =
            delegatorInfo?.delegations.reduce(
              (acc, delegation) => {
                const assetData = assetMap[delegation.assetId];
                if (assetData === undefined) {
                  return acc;
                }

                const assetPrice = assetData.priceInUsd ?? null;

                if (typeof assetPrice !== 'number') {
                  return acc;
                }

                const result = safeFormatUnits(
                  delegation.amountBonded,
                  assetData.decimals,
                );

                if (!result.sucess) {
                  return acc;
                }

                const formattedAmount = Number(result.value);

                acc[delegation.assetId] =
                  (acc[delegation.assetId] || 0) + formattedAmount * assetPrice;

                return acc;
              },
              {} as Record<string, number>,
            ) || {};

          const totalDelegatorTVL = Object.values(delegatorTVL).reduce(
            (sum, tvl) => sum + tvl,
            0,
          );

          return of({
            delegatorTVL,
            operatorConcentration,
            operatorTVL,
            poolTVL,
            totalDelegatorTVL,
            totalNetworkTVL,
          });
        }),
      ),
    [operatorMap, delegatorInfo, assetMap],
  );

  const tvl = useObservableState(tvl$, {
    delegatorTVL: {},
    operatorConcentration: {},
    operatorTVL: {},
    poolTVL: {},
    totalDelegatorTVL: 0,
    totalNetworkTVL: 0,
  });

  return tvl;
}
