import { encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';

/**
 * Unifying the way we display account addresses, ensure we always return
 * the same format for an account address.
 *
 * @param {string | null | undefined} address - The account address to be formatted.
 * @param {number} [ss58Prefix] - Optional ss58 prefix for encoding the address.
 * @returns {string | null} - The formatted account address or null if the input address is invalid.
 */
export default function tryEncodeSubstrateAddress(
  address: string | null | undefined,
  ss58Prefix?: number,
): string | null {
  if (address === null || address === undefined || address.length === 0) {
    return null;
  }
  // If the active account is an EVM address, return it as is.
  else if (isEthereumAddress(address)) {
    return address;
  }
  // If the active network has an associated ss58 prefix, encode
  // the address using that ss58 prefix.
  else if (ss58Prefix !== undefined) {
    return encodeAddress(address, ss58Prefix);
  }

  // Otherwise, return the address as is.
  return address;
}
