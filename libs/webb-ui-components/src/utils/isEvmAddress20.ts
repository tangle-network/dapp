import { isEthereumAddress } from '@polkadot/util-crypto';
import { EvmAddress20 } from '../types/address';

export function isEvmAddress20(address: string): address is EvmAddress20 {
  // 20-byte address is 40 characters long + 2 for the prefix.
  return isEthereumAddress(address) && address.length === 42;
}
