import { u128 } from '@polkadot/types';
import { TangleAssetId } from '../types';

export default function isCustomAsset(
  assetId: TangleAssetId,
): assetId is { Custom: u128 } {
  return 'Custom' in assetId;
}
