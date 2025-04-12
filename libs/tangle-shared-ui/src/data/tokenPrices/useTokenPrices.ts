import { useMemorizedValue } from '@tangle-network/ui-components';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';
import { skipToken, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import useNetworkStore from '../../context/useNetworkStore';
import { fetchTokenPrices } from './fetchTokenPrices';

const CACHE_KEY = 'token-price-cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useTokenPrices(tokenSymbolSetArg: Set<string> | null) {
  const tokenSymbolSet = useMemorizedValue(tokenSymbolSetArg);
  const network = useNetworkStore((store) => store.network2);

  return useQuery({
    queryKey: ['tokenPrices', ...(tokenSymbolSet ?? []), network?.id],
    queryFn:
      // Only fetch token prices for TANGLE_MAINNET
      tokenSymbolSet && network?.id === NetworkId.TANGLE_MAINNET
        ? () => fetcher(tokenSymbolSet)
        : skipToken,
    staleTime: CACHE_EXPIRY,
    initialData: getInitialData(),
  });
}

const getInitialData = () => {
  const cachedPrices = getCachedPrices();
  return new Map(
    Object.entries(cachedPrices).map(([symbol, { price }]) => {
      return [symbol, price];
    }),
  );
};

const fetcher = async (tokenSymbols: Set<string>) => {
  // Get tokens that need to be fetched
  const tokensToFetch = getTokensToFetch(tokenSymbols);

  // Get cached prices
  const cache = getCachedPrices();
  const result = new Map<string, number | null>();

  // If all tokens are cached and not expired, return from cache
  if (tokensToFetch.size === 0) {
    tokenSymbols.forEach((symbol) => {
      result.set(symbol, cache[symbol]?.price ?? null);
    });
    return result;
  }

  // Fetch new prices for expired/missing tokens
  const newPrices = await fetchTokenPrices(tokensToFetch);

  // Update cache with new prices
  updateCachedPrices(newPrices);

  // Combine cached and new prices
  tokenSymbols.forEach((symbol) => {
    if (tokensToFetch.has(symbol)) {
      result.set(symbol, newPrices.get(symbol) ?? null);
    } else {
      result.set(symbol, cache[symbol]?.price ?? null);
    }
  });

  return result;
};

// Schema for cached token price
const cachedTokenPriceSchema = z.object({
  price: z.number(),
  timestamp: z.number(),
});

// Schema for the entire cache
const tokenPriceCacheSchema = z.record(z.string(), cachedTokenPriceSchema);

type TokenPriceCache = z.infer<typeof tokenPriceCacheSchema>;

// Helper to safely access localStorage
const getLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

// Helper to get cached prices
const getCachedPrices = (): TokenPriceCache => {
  const storage = getLocalStorage();
  if (!storage) return {};

  try {
    const cached = storage.getItem(CACHE_KEY);
    if (!cached) return {};

    const parsed = JSON.parse(cached);
    return tokenPriceCacheSchema.parse(parsed);
  } catch (error) {
    console.error('Error parsing token price cache:', error);
    return {};
  }
};

// Helper to update cached prices
const updateCachedPrices = (newPrices: Map<string, number | null>) => {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    const currentCache = getCachedPrices();
    const timestamp = Date.now();

    // Update cache with new prices
    newPrices.forEach((price, symbol) => {
      if (price !== null) {
        currentCache[symbol] = {
          price,
          timestamp,
        };
      }
    });

    storage.setItem(CACHE_KEY, JSON.stringify(currentCache));
  } catch (error) {
    console.error('Error updating token price cache:', error);
  }
};

// Helper to get tokens that need to be fetched
const getTokensToFetch = (tokenSymbols: Set<string>): Set<string> => {
  const cache = getCachedPrices();
  const now = Date.now();
  const tokensToFetch = new Set<string>();

  tokenSymbols.forEach((symbol) => {
    const cached = cache[symbol];
    if (!cached || now - cached.timestamp > CACHE_EXPIRY) {
      tokensToFetch.add(symbol);
    }
  });

  return tokensToFetch;
};
