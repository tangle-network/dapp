import { encodeAddress } from '@polkadot/util-crypto';
import { AnyAddress } from '../types/address';
import { isEvmAddress } from './isEvmAddress';

/**
 * If the address happens to be a Substrate address, encode it using the
 * provided ss58 prefix. Otherwise, return the address as is.
 */
export const tryEncodeSubstrateAddress = (
  address: AnyAddress | null | undefined,
  ss58Prefix?: number,
): AnyAddress | null => {
  if (address === null || address === undefined || address.length === 0) {
    return null;
  }
  // If the active account is an EVM address, return it as is.
  else if (isEvmAddress(address)) {
    return address;
  }
  // If the active network has an associated ss58 prefix, encode
  // the address using that ss58 prefix.
  else if (ss58Prefix !== undefined) {
    return encodeAddress(address, ss58Prefix);
  }

  // Otherwise, return the address as is.
  return address;
};
