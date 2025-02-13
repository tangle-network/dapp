import { isEvmAddress } from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { RestakeAssetId } from '../types';

export type AssetIdEnum =
  | {
      Custom: bigint;
    }
  | {
      Erc20: EvmAddress;
    };

const createAssetIdEnum = (assetId: RestakeAssetId): AssetIdEnum => {
  return isEvmAddress(assetId)
    ? { Erc20: assetId }
    : { Custom: BigInt(assetId) };
};

export default createAssetIdEnum;
