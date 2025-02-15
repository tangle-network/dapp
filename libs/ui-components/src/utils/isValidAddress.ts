import { EvmAddress, SubstrateAddress } from '../types/address';
import { isEvmAddress } from './isEvmAddress20';
import { isSubstrateAddress } from './isSubstrateAddress';

/**
 * Check if the address is valid EVM or Substrate address.
 */
export const isValidAddress = (
  address: string,
): address is EvmAddress | SubstrateAddress => {
  return isEvmAddress(address) || isSubstrateAddress(address);
};

export default isValidAddress;
