import axios from 'axios';
import { z } from 'zod';
import { PriceSource, TOKEN_ID, TokenId, TokenIdSchema } from '../types';

const CoinbaseResponseSchema = z.object({
  data: z.object({
    amount: z.string(),
    currency: z.string(),
    base: z.string(),
  }),
});

type CoinbaseResponse = z.infer<typeof CoinbaseResponseSchema>;

class CoinbasePriceSource extends PriceSource<CoinbaseResponse> {
  readonly id = 'coinbase';
  readonly baseUrl = 'https://api.coinbase.com/v2/prices';
  readonly ResponseSchema = CoinbaseResponseSchema;

  readonly SupportTokenIdPair = new Map<TokenId, string>([
    /** ETH and its derivatives */
    [TOKEN_ID.ETH, 'ETH-USD'],
    [TOKEN_ID.WETH, 'WETH-USD'],
    [TOKEN_ID.wstETH, 'wstETH-USD'],
    [TOKEN_ID.cbETH, 'cbETH-USD'],
    /** BTC and its derivatives */
    [TOKEN_ID.BTC, 'BTC-USD'],
    [TOKEN_ID.tBTC, 'tBTC-USD'],
  ]);

  async getPrice(tokenSymbol: string): Promise<number | null> {
    try {
      const tokenId = TokenIdSchema.parse(tokenSymbol);

      // Return 1 for stable tokens
      if (this.isStableToken(tokenId)) {
        return 1;
      }

      // Check cache first
      const cachedPrice = this.getCachedPrice(tokenSymbol);
      if (cachedPrice !== null) {
        return cachedPrice;
      }

      const pair = this.SupportTokenIdPair.get(tokenId);
      if (!pair) return null;

      const response = await axios.get(`${this.baseUrl}/${pair}/spot`);

      const data = this.ResponseSchema.parse(response.data);
      const price = this.parsePrice(data.data.amount);

      if (price !== null) {
        // Cache the price
        this.setCachedPrice(tokenSymbol, price);
      }

      return price;
    } catch (error) {
      console.error(
        `Failed to fetch price for ${tokenSymbol} from Coinbase:`,
        error,
      );
      return null;
    }
  }

  async getMultiplePrices(
    tokenSymbols: string[],
  ): Promise<Map<string, number | null>> {
    const results = new Map<string, number | null>();
    const validPairs = new Set<string>();

    // First, validate all tokens and collect valid pairs
    for (const asset of tokenSymbols) {
      try {
        const tokenId = TokenIdSchema.parse(asset);

        // Handle stable tokens
        if (this.isStableToken(tokenId)) {
          results.set(asset, 1);
          continue;
        }

        // Check cache first
        const cachedPrice = this.getCachedPrice(asset);
        if (cachedPrice !== null) {
          results.set(asset, cachedPrice);
          continue;
        }

        const pair = this.SupportTokenIdPair.get(tokenId);
        if (pair) {
          validPairs.add(pair);
        } else {
          results.set(asset, null);
        }
      } catch {
        results.set(asset, null);
      }
    }

    if (validPairs.size === 0) {
      return results;
    }

    // Fetch prices for valid pairs that weren't in cache
    const promises = Array.from(validPairs).map(async (pair) => {
      try {
        const response = await axios.get(`${this.baseUrl}/${pair}/spot`);
        const data = this.ResponseSchema.parse(response.data);
        return {
          pair,
          price: this.parsePrice(data.data.amount),
        };
      } catch (error) {
        console.error(
          `Failed to fetch price for ${pair} from Coinbase:`,
          error,
        );
        return {
          pair,
          price: null,
        };
      }
    });

    const settledResults = await Promise.allSettled(promises);

    // Map the results back to original assets and update cache
    for (const asset of tokenSymbols) {
      try {
        const tokenId = TokenIdSchema.parse(asset);
        const pair = this.SupportTokenIdPair.get(tokenId);
        if (pair) {
          const result = settledResults.find(
            (r) => r.status === 'fulfilled' && r.value.pair === pair,
          );
          const price =
            result?.status === 'fulfilled' ? result.value.price : null;

          results.set(asset, price);

          if (price !== null) {
            this.setCachedPrice(asset, price);
          }
        }
      } catch {
        // Already set to null in the first pass
      }
    }

    return results;
  }
}

export const coinbasePriceSource = new CoinbasePriceSource();
