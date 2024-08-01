import { decodeAddress } from '@polkadot/util-crypto';

/**
 * Compare two Substrate addresses to see if they are the same.
 *
 * This is useful when comparing addresses from different sources
 * that may have different SS58 formats, which will cause a display
 * mismatch, but the underlying account is the same.
 */
const compareSubstrateAddresses = (a: string, b: string): boolean => {
  const publicKeyA = decodeAddress(a);
  const publicKeyB = decodeAddress(b);

  // Compare the public keys as strings. This will bypass situations
  // where the SS58 format is different, but the account is the same.
  return publicKeyA.toString() === publicKeyB.toString();
};

export default compareSubstrateAddresses;
