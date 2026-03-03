import { NATIVE_ASSET_ID } from '../../constants/staking';
import type { StakingAssetId } from '../../types';

/**
 * Enum representing the different types of staking assets.
 */
export enum StakingAssetType {
  /** Regular asset that was deposited directly into multiAssetDelegation pallet */
  REGULAR = 'regular',
  /** Native asset that was nominated to validators and can be delegated */
  NOMINATED = 'nominated',
}

/**
 * Determines the type of a staking asset based on its ID and source.
 *
 * @param assetId - The asset ID to check
 * @param isFromNomination - Whether this asset comes from nomination (staking) balance
 * @returns The asset type (REGULAR or NOMINATED)
 */
export const getStakingAssetType = (
  assetId: StakingAssetId,
  isFromNomination: boolean,
): StakingAssetType => {
  if (assetId === NATIVE_ASSET_ID && isFromNomination) {
    return StakingAssetType.NOMINATED;
  }

  return StakingAssetType.REGULAR;
};

/**
 * Checks if an asset is nominated (from staking/nomination)
 */
export const isNominatedAsset = (
  assetId: StakingAssetId,
  isFromNomination: boolean,
): boolean => {
  return (
    getStakingAssetType(assetId, isFromNomination) ===
    StakingAssetType.NOMINATED
  );
};

export default getStakingAssetType;
