import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../context/RestakeContext';
import type { DelegatorInfo, OperatorMap } from '../../types/restake';

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
                  const assetPrice = asset?.priceInUsd || Number.NaN;

                  if (Number.isNaN(assetPrice)) {
                    return sum;
                  }

                  const formattedAmount = Number(
                    formatUnits(delegation.amount, asset.decimals),
                  );

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

          const delegatorTVL =
            delegatorInfo?.delegations.reduce(
              (acc, delegation) => {
                const assetPrice =
                  assetMap[delegation.assetId]?.priceInUsd || Number.NaN;

                if (Number.isNaN(assetPrice)) {
                  return acc;
                }

                const formattedAmount = Number(
                  formatUnits(
                    delegation.amountBonded,
                    assetMap[delegation.assetId].decimals,
                  ),
                );

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
            operatorTVL,
            poolTVL,
            totalNetworkTVL,
            delegatorTVL,
            totalDelegatorTVL,
          });
        }),
      ),
    [operatorMap, delegatorInfo, assetMap],
  );

  const tvl = useObservableState(tvl$, {
    operatorTVL: {},
    poolTVL: {},
    totalNetworkTVL: 0,
    delegatorTVL: {},
    totalDelegatorTVL: 0,
  });

  return tvl;
}
