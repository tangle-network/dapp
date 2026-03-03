import {
  useStakingAsset as useStakingAssetBase,
  useStakingAssets as useStakingAssetsBase,
} from '../graphql/useStakingAssets';
import type {
  ProtocolStakingAsset,
  StakingAsset as BaseStakingAsset,
  StakingAssetMap as BaseStakingAssetMap,
  StakingTokenMetadata,
} from '../graphql/useStakingAssets';

export type StakingAsset = BaseStakingAsset;
export type StakingAssetMap = BaseStakingAssetMap;
export type StakingConfigAsset = ProtocolStakingAsset;
export type { StakingTokenMetadata };

export const useStakingAssets = useStakingAssetsBase;
export const useStakingAsset = useStakingAssetBase;

export default useStakingAssets;
