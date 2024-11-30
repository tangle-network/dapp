import { EvmAddress20 } from '../types/address';
import { isEvmAddress } from './isEvmAddress';

export function isEvmAddress20(address: string): address is EvmAddress20 {
  // 20-byte address is 40 characters long + 2 for the prefix.
  return isEvmAddress(address) && address.length === 42;
}
