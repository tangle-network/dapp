import { isEthereumAddress } from '@polkadot/util-crypto';
import { EvmAddress32 } from '../types/address';

export function isEvmAddress32(address: string): address is EvmAddress32 {
  // 32-byte address is 64 characters long + 2 for the prefix.
  return isEthereumAddress(address) && address.length === 66;
}
