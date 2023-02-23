import { parseTypedChainId } from '@webb-tools/sdk-core';

interface EVMNativeCurrency {
  decimals: number;
  symbol: string;
  name: string;
}

// The chain info is retrieved from https://github.com/ethereum-lists/chains
const CHAIN_URL = 'https://chainid.network/chains.json';

let chainData: Array<{ nativeCurrency: EVMNativeCurrency; chainId: number }>;

// Cache the native currencies to avoid fetching the chain data multiple times
// chainId -> nativeCurrency
const nativeCurrenciesCache = new Map<number, EVMNativeCurrency>();

/**
 * Retrieves the native token info for the given evm chain id
 * @param typedChainId the typed chain id to get the native token info for
 * @returns the native token info for the given evm chain id
 */
export const fetchEVMNativeCurrency = async (
  typedChainId: number
): Promise<EVMNativeCurrency | null> => {
  const { chainId } = parseTypedChainId(typedChainId);
  if (!chainData) {
    try {
      const response = await fetch(CHAIN_URL);
      if (!response.ok) {
        throw new Error('Unable to retrieve native token information');
      }

      chainData = await response.json();
    } catch (error) {
      console.log('Unable to retrieve native token information', error);
      return null;
    }
  }

  if (nativeCurrenciesCache.has(chainId)) {
    return nativeCurrenciesCache.get(chainId);
  }

  const chain = chainData.find((chain) => chain.chainId === chainId);

  if (!chain) {
    return null;
  }

  nativeCurrenciesCache.set(chainId, chain.nativeCurrency);
  return chain.nativeCurrency;
};
