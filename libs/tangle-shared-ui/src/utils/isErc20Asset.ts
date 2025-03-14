import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { TangleAssetId } from '../types';

export default function isErc20Asset(
  assetId: TangleAssetId,
): assetId is { Erc20: EvmAddress } {
  return 'Erc20' in assetId;
}
