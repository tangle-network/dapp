import { u128 } from '@polkadot/types';
import { TanglePrimitivesServicesAsset } from '@polkadot/types/lookup';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { Address } from 'viem';

export type RestakeAssetId = `${number}` | EvmAddress;

export type TangleAssetId = { Custom: u128 } | { Erc20: Address };

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
