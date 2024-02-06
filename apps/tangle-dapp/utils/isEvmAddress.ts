import { isEthereumAddress } from '@polkadot/util-crypto';
import { AddressType } from '@webb-tools/dapp-config/types';

export function isEvmAddress(address: string): address is AddressType {
  return isEthereumAddress(address);
}
