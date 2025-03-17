import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';
import { RestakeAssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { RestakeAssetId } from '../../types';
import { assertSubstrateAddress } from '@tangle-network/ui-components/utils';

type useOperatorTVLType = {
  operatorTVLByAsset: Record<SubstrateAddress, Record<RestakeAssetId, number>>;
  operatorTVL: Record<SubstrateAddress, number>;
  vaultTVL: Record<RestakeAssetId, number>;
};

const calculateTVL = (
  operatorMap: OperatorMap,
  assetMap: RestakeAssetMap,
): useOperatorTVLType => {
  return Object.entries(operatorMap).reduce(
    (acc: useOperatorTVLType, [_operatorId, operatorData]) => {
      const operatorId = assertSubstrateAddress(_operatorId);

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
        if (!acc.operatorTVLByAsset[operatorId]) {
          acc.operatorTVLByAsset[operatorId] = {};
        }

        // Add amount to the specific operator and asset combination
        acc.operatorTVLByAsset[operatorId][delegation.assetId] =
          (acc.operatorTVLByAsset[operatorId][delegation.assetId] || 0) +
          amount;

        // Track total TVL by asset ID
        acc.vaultTVL[delegation.assetId] =
          (acc.vaultTVL[delegation.assetId] || 0) + amount;

        // Calculate total TVL for operator (sum of all their assets)
        acc.operatorTVL[operatorId] =
          (acc.operatorTVL[operatorId] || 0) + amount;

        return;
      });

      return acc;
    },
    {
      operatorTVLByAsset: {},
      vaultTVL: {},
      operatorTVL: {},
    } satisfies useOperatorTVLType,
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
            return of<useOperatorTVLType>({
              operatorTVLByAsset: {},
              vaultTVL: {},
              operatorTVL: {},
            });
          }

          const { operatorTVLByAsset, operatorTVL, vaultTVL } = calculateTVL(
            operatorMap,
            assetMap,
          );

          return of<useOperatorTVLType>({
            operatorTVLByAsset,
            operatorTVL,
            vaultTVL,
          });
        }),
      ),
    [operatorMap, assetMap],
  );

  return useObservableState(tvl$, {
    operatorTVLByAsset: {},
    operatorTVL: {},
    vaultTVL: {},
  });
};
