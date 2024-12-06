import { isEthereumAddress } from '@polkadot/util-crypto';
import { EvmAddress } from '../types/address';

export function isEvmAddress(address: string): address is EvmAddress {
  // 20-byte address is 40 characters long + 2 for the prefix.
  return isEthereumAddress(address) && address.length === 42;
}
