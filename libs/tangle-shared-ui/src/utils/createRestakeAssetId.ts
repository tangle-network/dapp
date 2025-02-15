import { TanglePrimitivesServicesAsset } from '@polkadot/types/lookup';
import { assertEvmAddress } from '@tangle-network/ui-components';
import { checksumAddress } from 'viem';
import { RestakeAssetId } from '../types';

const createRestakeAssetId = (
  tangleAssetId: TanglePrimitivesServicesAsset,
): RestakeAssetId => {
  switch (tangleAssetId.type) {
    case 'Custom':
      return `${tangleAssetId.asCustom.toBigInt()}`;
    case 'Erc20':
      return assertEvmAddress(checksumAddress(tangleAssetId.asErc20.toHex()));
  }
};

export default createRestakeAssetId;
