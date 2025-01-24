import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { RestakeAssetId } from './createRestakeAssetId';
import { isEvmAddress } from '@webb-tools/webb-ui-components';

export type AssetIdEnum =
  | {
      Custom: `${number}`;
    }
  | {
      Erc20: EvmAddress;
    };

const createAssetIdEnum = (assetId: RestakeAssetId): AssetIdEnum => {
  return isEvmAddress(assetId) ? { Erc20: assetId } : { Custom: assetId };
};

export default createAssetIdEnum;
