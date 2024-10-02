import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';

import type { AssetMap, DelegatorInfo } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';

export function useDelegatorTVL(
  delegatorInfo: DelegatorInfo | null,
  assetMap: AssetMap,
) {
  const tvl$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([delegatorInfo, assetMap]) => {
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

                if (!result.success) {
                  return acc;
                }

                const formattedAmount = Number(result.value);

                // Update the TVL for this asset, defaulting to 0 if it doesn't exist yet
                // This allows for accumulating TVL across multiple delegations of the same asset
                acc[delegation.assetId] =
                  (acc[delegation.assetId] || 0) + formattedAmount * assetPrice;

                return acc;
              },
              {} as Record<string, number>,
            ) ?? {};

          const totalDelegatorTVL = Object.values(delegatorTVL).reduce(
            (sum, tvl) => sum + tvl,
            0,
          );

          return of({ delegatorTVL, totalDelegatorTVL });
        }),
      ),
    [delegatorInfo, assetMap],
  );

  return useObservableState(tvl$, { delegatorTVL: {}, totalDelegatorTVL: 0 });
}
