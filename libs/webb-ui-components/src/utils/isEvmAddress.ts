import { EvmAddress } from '../types/address';
import { isEvmAddress20 } from './isEvmAddress20';
import { isEvmAddress32 } from './isEvmAddress32';

export function isEvmAddress(address: string): address is EvmAddress {
  return isEvmAddress20(address) || isEvmAddress32(address);
}
