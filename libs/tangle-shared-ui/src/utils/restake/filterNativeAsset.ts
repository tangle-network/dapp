import { zeroAddress } from 'viem';
import { RestakeAssetId } from '../../types';

/**
 * By convention, the native asset ID is `0`.
 * This function filters out the native asset ID from the list of asset IDs.
 *
 * @param assetIds the asset IDs to filter
 * @returns
 *  - `hasNative`: Whether the native asset ID is present.
 *  - `nonNativeIds`: The non-native asset IDs.
 */
export default function filterNativeAsset(assetIds: RestakeAssetId[]) {
  let hasNative = false;

  // Filter out the native asset ID
  const nonNativeAssetIds = assetIds.filter((assetId) => {
    if (assetId === '0' || assetId === zeroAddress) {
      hasNative = true;

      return false;
    }

    return true;
  });

  return {
    hasNative,
    nonNativeAssetIds,
  };
}
