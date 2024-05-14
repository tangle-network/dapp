import { isEthereumAddress } from '@polkadot/util-crypto';
import isSubstrateAddress from './isSubstrateAddress.js';

/**
 * Check if the address is valid or not,
 * address can be in evm format, ss58 format or decoded address
 * @param address the address to check
 * @returns true if the address is valid, false otherwise
 */
export default function isValidAddress(address: string): boolean {
  const maybeEvm = address.replace('0x', '').length === 40;

  // is valid evm address
  if (maybeEvm) {
    return isEthereumAddress(address);
  }

  return isSubstrateAddress(address);
}
