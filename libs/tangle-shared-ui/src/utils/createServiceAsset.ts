import { isEvmAddress } from '@webb-tools/webb-ui-components';
import type { RestakeAssetId } from '../types';

const createServiceAsset = (assetId: RestakeAssetId) => {
  if (isEvmAddress(assetId)) {
    return {
      Erc20: assetId,
    };
  } else {
    return {
      Custom: BigInt(assetId),
    };
  }
};

export default createServiceAsset;
