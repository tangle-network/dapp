import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';
import { formatUnits } from 'viem';

import useRestakeAssetMap from './useRestakeAssetMap';
import useRestakeDelegatorInfo from './useRestakeDelegatorInfo';
import useRestakeOperatorMap from './useRestakeOperatorMap';

export default function useRestakeTVL() {
  const { operatorMap } = useRestakeOperatorMap();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { assetMap } = useRestakeAssetMap();

  const tvl$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([operatorMap, delegatorInfo, assetMap]) => {
          const operatorTVL = Object.entries(operatorMap).reduce(
            (acc, [operatorId, operatorData]) => {
              const operatorTVL = operatorData.delegations.reduce(
                (sum, delegation) => {
                  const assetPrice =
                    assetMap[delegation.assetId]?.priceInUsd || Number.NaN;

                  if (Number.isNaN(assetPrice)) {
                    return sum;
                  }

                  const formattedAmount = Number(
                    formatUnits(
                      delegation.amount,
                      assetMap[delegation.assetId].decimals,
                    ),
                  );

                  return sum + formattedAmount * assetPrice;
                },
                0,
              );
              acc[operatorId] = operatorTVL;
              return acc;
            },
            {} as Record<string, number>,
          );

          const totalNetworkTVL = Object.values(operatorTVL).reduce(
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
    totalNetworkTVL: 0,
    delegatorTVL: {},
    totalDelegatorTVL: 0,
  });

  return tvl;
}
