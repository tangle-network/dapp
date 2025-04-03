import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { SubstrateAddress } from '../types/address';

// Cache to store results for previously checked addresses
const addressCache = new Map<string, boolean>();

export const isSubstrateAddress = (
  address: string,
  ignoreCache = false,
): address is SubstrateAddress => {
  // Check if result is already in cache and we're not ignoring the cache
  if (!ignoreCache) {
    const cachedResult = addressCache.get(address);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
  }

  // It seems that `isAddress` returns true for EVM addresses.
  // Check also that it is NOT an EVM address to prevent bugs.
  const result = !isEthereumAddress(address) && isAddress(address);

  // Store result in cache
  addressCache.set(address, result);

  return result;
};
