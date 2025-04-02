import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';
import { RestakeAssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { RestakeAssetId } from '../../types';
import { assertSubstrateAddress } from '@tangle-network/ui-components/utils';

export type OperatorTVLType = {
  operatorTVLByAsset: Map<SubstrateAddress, Map<RestakeAssetId, number>>;
  operatorTVL: Map<SubstrateAddress, number>;
  vaultTVL: Map<RestakeAssetId, number>;
};

const calculateTVL = (
  operatorMap: OperatorMap,
  assetMap: RestakeAssetMap,
): OperatorTVLType => {
  return Object.entries(operatorMap).reduce(
    (acc: OperatorTVLType, [operatorId_, operatorData]) => {
      const operatorId = assertSubstrateAddress(operatorId_);

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

        if (!acc.operatorTVLByAsset.has(operatorId)) {
          acc.operatorTVLByAsset.set(operatorId, new Map());
        }

        acc.operatorTVLByAsset
          .get(operatorId)
          ?.set(
            delegation.assetId,
            (acc.operatorTVLByAsset.get(operatorId)?.get(delegation.assetId) ||
              0) + amount,
          );

        acc.vaultTVL.set(
          delegation.assetId,
          (acc.vaultTVL.get(delegation.assetId) || 0) + amount,
        );

        acc.operatorTVL.set(
          operatorId,
          (acc.operatorTVL.get(operatorId) || 0) + amount,
        );

        return;
      });

      return acc;
    },
    {
      operatorTVLByAsset: new Map(),
      vaultTVL: new Map(),
      operatorTVL: new Map(),
    } satisfies OperatorTVLType,
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
            return of<OperatorTVLType>({
              operatorTVLByAsset: new Map(),
              vaultTVL: new Map(),
              operatorTVL: new Map(),
            });
          }

          const { operatorTVLByAsset, operatorTVL, vaultTVL } = calculateTVL(
            operatorMap,
            assetMap,
          );

          return of<OperatorTVLType>({
            operatorTVLByAsset,
            operatorTVL,
            vaultTVL,
          });
        }),
      ),
    [operatorMap, assetMap],
  );

  return useObservableState<OperatorTVLType>(tvl$, {
    operatorTVLByAsset: new Map(),
    operatorTVL: new Map(),
    vaultTVL: new Map(),
  });
};
