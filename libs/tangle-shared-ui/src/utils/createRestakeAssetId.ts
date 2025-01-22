import { TanglePrimitivesServicesAsset } from '@polkadot/types/lookup';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';
import { RestakeAssetId } from '../types';

const createRestakeAssetId = (
  tangleAssetId: TanglePrimitivesServicesAsset,
): RestakeAssetId => {
  switch (tangleAssetId.type) {
    case 'Custom':
      return `${tangleAssetId.asCustom.toNumber()}`;
    case 'Erc20':
      return assertEvmAddress(tangleAssetId.asErc20.toHex());
  }
};

export default createRestakeAssetId;
