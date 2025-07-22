import { TanglePrimitivesServicesTypesAssetU128 } from '@polkadot/types/lookup';
import { assertEvmAddress } from '@tangle-network/ui-components';
import { RestakeAssetId } from '../types';

const createRestakeAssetId = (
  tangleAssetId: TanglePrimitivesServicesTypesAssetU128,
): RestakeAssetId => {
  switch (tangleAssetId.type) {
    case 'Custom':
      return `${tangleAssetId.asCustom.toBigInt()}`;
    case 'Erc20':
      return assertEvmAddress(tangleAssetId.asErc20.toHex());
    default:
      throw new Error(`Unsupported asset type: ${tangleAssetId.type}`);
  }
};

export default createRestakeAssetId;
