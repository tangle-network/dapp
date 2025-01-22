import { Address } from 'viem';
import { TangleAssetId } from '../types';

export default function isErc20Asset(
  assetId: TangleAssetId,
): assetId is { Erc20: Address } {
  return 'Erc20' in assetId;
}
