import { useObservable, useObservableState } from 'observable-hooks';
import { Observable, of, switchMap } from 'rxjs';
import { RestakeAssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { RestakeAssetId } from '../../types';
import { assertSubstrateAddress } from '@tangle-network/ui-components/utils';
import { useMemo, useCallback } from 'react';
import useRestakeAssets from './useRestakeAssets';
import useRestakeOperatorMap from './useRestakeOperatorMap';

export type OperatorTvlGroup = {
  operatorTvlByAsset: Map<SubstrateAddress, Map<RestakeAssetId, number>>;
  operatorTvl: Map<SubstrateAddress, number>;
  vaultTvl: Map<RestakeAssetId, number>;
};

const calculateTvl = (
  operatorMap: OperatorMap,
  assetMap: RestakeAssetMap,
): OperatorTvlGroup => {
  return Array.from(operatorMap.entries()).reduce(
    (acc: OperatorTvlGroup, [operatorId_, operatorData]) => {
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

        if (!acc.operatorTvlByAsset.has(operatorId)) {
          acc.operatorTvlByAsset.set(operatorId, new Map());
        }

        acc.operatorTvlByAsset
          .get(operatorId)
          ?.set(
            delegation.assetId,
            (acc.operatorTvlByAsset.get(operatorId)?.get(delegation.assetId) ||
              0) + amount,
          );

        acc.vaultTvl.set(
          delegation.assetId,
          (acc.vaultTvl.get(delegation.assetId) || 0) + amount,
        );

        acc.operatorTvl.set(
          operatorId,
          (acc.operatorTvl.get(operatorId) || 0) + amount,
        );

        return;
      });

      return acc;
    },
    {
      operatorTvlByAsset: new Map(),
      vaultTvl: new Map(),
      operatorTvl: new Map(),
    } satisfies OperatorTvlGroup,
  );
};

const useOperatorTvl = () => {
  const { result: operatorMap } = useRestakeOperatorMap();
  const { assets } = useRestakeAssets();

  const tvl$ = useObservable(
    useCallback<
      (
        input$: Observable<[OperatorMap, RestakeAssetMap | null]>,
      ) => Observable<OperatorTvlGroup>
    >(
      (input$) =>
        input$.pipe(
          switchMap(([operatorMap, assets]) => {
            if (assets === null) {
              return of<OperatorTvlGroup>({
                operatorTvlByAsset: new Map(),
                vaultTvl: new Map(),
                operatorTvl: new Map(),
              });
            }

            return of<OperatorTvlGroup>(calculateTvl(operatorMap, assets));
          }),
        ),
      [],
    ),
    [operatorMap, assets],
  );

  const initialState = useMemo(
    () => ({
      operatorTvlByAsset: new Map(),
      operatorTvl: new Map(),
      vaultTvl: new Map(),
    }),
    [],
  );

  return useObservableState<OperatorTvlGroup>(tvl$, initialState);
};

export default useOperatorTvl;
