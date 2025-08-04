import { NATIVE_ASSET_ID } from '../../constants/restaking';
import { RestakeAssetId } from '../../types';

/**
 * Enum representing the different types of restake assets
 */
export enum RestakeAssetType {
  /** Regular asset that was deposited directly into multiAssetDelegation pallet */
  REGULAR = 'regular',
  /** Native asset that was nominated to validators and can be delegated */
  NOMINATED = 'nominated',
}

/**
 * Determines the type of a restake asset based on its ID and source
 *
 * @param assetId - The asset ID to check
 * @param isFromNomination - Whether this asset comes from nomination (staking) balance
 * @returns The asset type (REGULAR or NOMINATED)
 */
export const getRestakeAssetType = (
  assetId: RestakeAssetId,
  isFromNomination: boolean,
): RestakeAssetType => {
  if (assetId === NATIVE_ASSET_ID && isFromNomination) {
    return RestakeAssetType.NOMINATED;
  }

  return RestakeAssetType.REGULAR;
};

/**
 * Checks if an asset is nominated (from staking/nomination)
 */
export const isNominatedAsset = (
  assetId: RestakeAssetId,
  isFromNomination: boolean,
): boolean => {
  return (
    getRestakeAssetType(assetId, isFromNomination) ===
    RestakeAssetType.NOMINATED
  );
};

export default getRestakeAssetType;
