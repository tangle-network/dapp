import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';

import type { AssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';

export function useOperatorTVL(operatorMap: OperatorMap, assetMap: AssetMap) {
  const tvl$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([operatorMap, assetMap]) => {
          const { operatorTVL, vaultTVL } = Object.entries(operatorMap).reduce(
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

                  // Calculate vault TVL
                  const vaultId = asset.vaultId;
                  if (vaultId !== null) {
                    acc.vaultTVL[vaultId] =
                      (acc.vaultTVL[vaultId] || 0) +
                      formattedAmount * assetPrice;
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
              vaultTVL: {} as Record<string, number>,
            },
          );

          return of({ operatorTVL, vaultTVL });
        }),
      ),
    [operatorMap, assetMap],
  );

  return useObservableState(tvl$, { operatorTVL: {}, vaultTVL: {} });
}
