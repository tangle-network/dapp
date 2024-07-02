import { u128 } from '@polkadot/types';

/**
 * By convention, the native asset ID is `0`.
 * This function filters out the native asset ID from the list of asset IDs.
 *
 * @param assetIds the asset IDs to filter
 * @returns
 *  - `hasNative`: Whether the native asset ID is present.
 *  - `nonNativeIds`: The non-native asset IDs.
 */
export default function filterNativeAsset(assetIds: u128[]) {
  let hasNative = false;

  // Filter out the native asset ID
  const nonNativeAssetIds = assetIds.filter((assetId) => {
    if (assetId.isZero()) {
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
