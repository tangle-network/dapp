import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';

/**
 * Check if the address is valid or not,
 * address can be in evm format, ss58 format or decoded address
 * @param address the address to check
 * @returns true if the address is valid, false otherwise
 */
export default function isValidAddress(address: string): boolean {
  const maybeEvm = address.replace('0x', '').length === 40;
  const maybeSS58 = !address.startsWith('0x');
  const maybeDecodedAddress = address.replace('0x', '').length === 64;
  // is valid evm address
  if (maybeEvm) {
    return isEthereumAddress(address);
  }

  if (maybeSS58) {
    try {
      encodeAddress(decodeAddress(address));
      return true;
    } catch {
      return false;
    }
  }

  if (maybeDecodedAddress) {
    try {
      encodeAddress(address);
      return true;
    } catch (e) {
      return false;
    }
  }

  return false;
}
