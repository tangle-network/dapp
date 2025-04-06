import { isEthereumAddress } from '@polkadot/util-crypto';
import { EvmAddress } from '../types/address';

// Cache to store results for previously checked addresses
const addressCache = new Map<string, boolean>();

export function isEvmAddress(
  address: string,
  ignoreCache = false,
): address is EvmAddress {
  // Check if result is already in cache and we're not ignoring the cache
  if (!ignoreCache) {
    const cachedResult = addressCache.get(address);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
  }

  // 20-byte address is 40 characters long + 2 for the prefix.
  const result = isEthereumAddress(address) && address.length === 42;

  // Store result in cache
  addressCache.set(address, result);

  return result;
}
