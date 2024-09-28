import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';

import type { AssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';

export function useOperatorTVL(operatorMap: OperatorMap, assetMap: AssetMap) {
  const tvl$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([operatorMap, assetMap]) => {
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

          return of({ operatorTVL, poolTVL });
        }),
      ),
    [operatorMap, assetMap],
  );

  return useObservableState(tvl$, { operatorTVL: {}, poolTVL: {} });
}
