import { TanglePrimitivesServicesTypesAsset } from '@polkadot/types/lookup';
import { assertEvmAddress } from '@tangle-network/ui-components';
import { RestakeAssetId } from '../types';

const createRestakeAssetId = (
  tangleAssetId: TanglePrimitivesServicesTypesAsset,
): RestakeAssetId => {
  switch (tangleAssetId.type) {
    case 'Custom':
      return `${tangleAssetId.asCustom.toBigInt()}`;
    case 'Erc20':
      return assertEvmAddress(tangleAssetId.asErc20.toHex());
  }
};

export default createRestakeAssetId;
