import { binancePriceSource } from './sources/binance';
import { coinbasePriceSource } from './sources/coinbase';
import { coingeckoPriceSource } from './sources/coingecko';
import { PriceSource } from './types';

// List of price sources to try in sequence
const PRICE_SOURCES = [
  binancePriceSource,
  coinbasePriceSource,
  coingeckoPriceSource,
] as const satisfies PriceSource<unknown>[];

/**
 * Fetches token prices from multiple sources in sequence.
 * If a source fails, it will continue with the next source for the remaining tokens.
 * @param tokenSymbols List of token symbols to fetch prices for
 * @returns Map of token symbols to their prices (or null if no source could fetch the price)
 */
export async function fetchTokenPrices(
  tokenSymbols: Set<string>,
): Promise<Map<string, number | null>> {
  // Initialize result map with null values
  const results = new Map<string, number | null>();
  for (const symbol of tokenSymbols) {
    results.set(symbol, null);
  }

  // Keep track of which tokens still need prices
  let remainingTokens = new Set(tokenSymbols);

  // Try each source in sequence
  for (const source of PRICE_SOURCES) {
    if (remainingTokens.size === 0) {
      break; // All tokens have prices, no need to try more sources
    }

    try {
      // Get prices from current source for remaining tokens
      const sourceResults = await source.getMultiplePrices(remainingTokens);

      // Update results and remaining tokens
      const newRemainingTokens = new Set<string>();
      for (const token of remainingTokens) {
        const price = sourceResults.get(token) ?? null;
        if (price !== null) {
          results.set(token, price);
        } else {
          newRemainingTokens.add(token);
        }
      }
      remainingTokens = newRemainingTokens;
    } catch (error) {
      console.error(`Failed to fetch prices from ${source.id}:`, error);
      // Continue with next source
    }
  }

  return results;
}
