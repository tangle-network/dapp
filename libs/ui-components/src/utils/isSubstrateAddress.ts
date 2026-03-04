import { SubstrateAddress } from '../types/address';
import { isEvmAddress } from './isEvmAddress20';

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

  // Best-effort SS58/base58 format detection for UI display.
  const result =
    !isEvmAddress(address) && /^[1-9A-HJ-NP-Za-km-z]{47,50}$/.test(address);

  // Store result in cache
  addressCache.set(address, result);

  return result;
};
