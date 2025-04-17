import type { RestakeAssetMap, OperatorMap } from '../../types/restake';
import safeFormatUnits from '../../utils/safeFormatUnits';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { assertSubstrateAddress } from '@tangle-network/ui-components/utils';
import { useMemo } from 'react';
import type { RestakeAssetId } from '../../types';
import useRestakeOperatorMap from './useRestakeOperatorMap';
import useRestakeAssets from './useRestakeAssets';

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

      for (const delegation of operatorData.delegations) {
        const asset = assetMap.get(delegation.assetId);

        if (asset === undefined) {
          continue;
        }

        const assetPrice = asset.metadata.priceInUsd ?? null;

        if (typeof assetPrice !== 'number') {
          continue;
        }

        const result = safeFormatUnits(
          delegation.amount,
          asset.metadata.decimals,
        );

        if (!result.success) {
          continue;
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
      }

      return acc;
    },
    {
      operatorTvlByAsset: new Map(),
      vaultTvl: new Map(),
      operatorTvl: new Map(),
    } satisfies OperatorTvlGroup,
  );
};

type ReturnType = {
  operatorTvlByAsset: Map<SubstrateAddress, Map<RestakeAssetId, number>>;
  operatorTvl: Map<SubstrateAddress, number>;
  vaultTvl: Map<RestakeAssetId, number>;
};

const useOperatorTvl = (): ReturnType => {
  const { result: operatorMap } = useRestakeOperatorMap();
  const { assets: assetMap } = useRestakeAssets();

  return useMemo(() => {
    if (assetMap === null) {
      return {
        operatorTvlByAsset: new Map<
          SubstrateAddress,
          Map<RestakeAssetId, number>
        >(),
        vaultTvl: new Map<RestakeAssetId, number>(),
        operatorTvl: new Map<SubstrateAddress, number>(),
      };
    }

    const { operatorTvlByAsset, operatorTvl, vaultTvl } = calculateTvl(
      operatorMap,
      assetMap,
    );

    return {
      operatorTvlByAsset,
      operatorTvl,
      vaultTvl,
    };
  }, [assetMap, operatorMap]);
};

export default useOperatorTvl;
