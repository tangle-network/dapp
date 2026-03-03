import type { StakingAssetMap, OperatorMap } from '../../types/staking';
import safeFormatUnits from '../../utils/safeFormatUnits';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { assertSubstrateAddress } from '@tangle-network/ui-components/utils';
import { useMemo } from 'react';
import type { StakingAssetId } from '../../types';
import useStakingOperatorMap from './useStakingOperatorMap';
import useSubstrateStakingAssets from './useStakingAssets';

export type OperatorTvlGroup = {
  operatorTvlByAsset: Map<SubstrateAddress, Map<StakingAssetId, number>>;
  operatorTvl: Map<SubstrateAddress, number>;
  vaultTvl: Map<StakingAssetId, number>;
};

const calculateTvl = (
  operatorMap: OperatorMap,
  assetMap: StakingAssetMap,
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
  operatorTvlByAsset: Map<SubstrateAddress, Map<StakingAssetId, number>>;
  operatorTvl: Map<SubstrateAddress, number>;
  vaultTvl: Map<StakingAssetId, number>;
};

const useOperatorTvl = (): ReturnType => {
  const { result: operatorMap } = useStakingOperatorMap();
  const { assets: assetMap } = useSubstrateStakingAssets();

  return useMemo(() => {
    if (assetMap === null) {
      return {
        operatorTvlByAsset: new Map<
          SubstrateAddress,
          Map<StakingAssetId, number>
        >(),
        vaultTvl: new Map<StakingAssetId, number>(),
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
