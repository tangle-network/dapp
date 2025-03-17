import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';
import { RestakeAssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';

const calculateTVL = (operatorMap: OperatorMap, assetMap: RestakeAssetMap) => {
  return Object.entries(operatorMap).reduce(
    (acc, [operatorId, operatorData]) => {
      operatorData.delegations.forEach((delegation) => {
        const asset = assetMap.get(delegation.assetId);
        if (asset === undefined) {
          return;
        }

        const assetPrice = asset.metadata.priceInUsd ?? null;

        if (typeof assetPrice !== 'number') {
          return;
        }

        const result = safeFormatUnits(
          delegation.amount,
          asset.metadata.decimals,
        );

        if (!result.success) {
          return;
        }

        const amount = Number(result.value) * assetPrice;

        // Initialize nested structure if it doesn't exist
        if (!acc.operatorTVL[operatorId]) {
          acc.operatorTVL[operatorId] = {};
        }

        // Add amount to the specific operator and asset combination
        acc.operatorTVL[operatorId][delegation.assetId] = 
          (acc.operatorTVL[operatorId][delegation.assetId] || 0) + amount;

        // Track total TVL by asset ID
        acc.vaultTVL[delegation.assetId] = 
          (acc.vaultTVL[delegation.assetId] || 0) + amount;

        return;
      });

      return acc;
    },
    {
      operatorTVL: {} as Record<string, Record<string, number>>,
      vaultTVL: {} as Record<string, number>,
    },
  );
};

export const useOperatorTVL = (
  operatorMap: OperatorMap,
  assetMap: RestakeAssetMap | null,
) => {
  const tvl$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([operatorMap, assetMap]) => {
          if (assetMap === null) {
            return of({
              operatorTVL: {},
              vaultTVL: {},
            });
          }

          const { operatorTVL, vaultTVL } = calculateTVL(operatorMap, assetMap);

          return of({ operatorTVL, vaultTVL });
        }),
      ),
    [operatorMap, assetMap],
  );

  return useObservableState(tvl$, { operatorTVL: {}, vaultTVL: {} });
};
