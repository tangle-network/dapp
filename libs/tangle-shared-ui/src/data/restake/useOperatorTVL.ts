import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';
import { RestakeAssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';

const calculateTVL = (operatorMap: OperatorMap, assetMap: RestakeAssetMap) => {
  return Object.entries(operatorMap).reduce(
    (acc, [operatorId, operatorData]) => {
      const operatorTVL = operatorData.delegations.reduce((sum, delegation) => {
        const asset = assetMap.get(delegation.assetId);

        if (asset === undefined) {
          return sum;
        }

        const assetPrice = asset.metadata.priceInUsd ?? null;

        if (typeof assetPrice !== 'number') {
          return sum;
        }

        const result = safeFormatUnits(
          delegation.amount,
          asset.metadata.decimals,
        );

        if (!result.success) {
          return sum;
        }

        const amount = Number(result.value);

        // Calculate operator TVL.
        sum += amount * assetPrice;

        // Calculate vault TVL.
        const vaultId = asset.metadata.vaultId;

        if (vaultId !== null) {
          acc.vaultTVL[vaultId] =
            (acc.vaultTVL[vaultId] || 0) + amount * assetPrice;
        }

        return sum;
      }, 0);

      acc.operatorTVL[operatorId] = operatorTVL;
      return acc;
    },
    {
      operatorTVL: {} as Record<string, number>,
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
          type Result = Record<string, number>;

          if (assetMap === null) {
            return of({
              operatorTVL: {} satisfies Result as Result,
              vaultTVL: {} satisfies Result as Result,
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
