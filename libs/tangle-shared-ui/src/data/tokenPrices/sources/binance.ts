import axios from 'axios';
import { z } from 'zod';
import { PriceSource, TOKEN_ID, TokenId, TokenIdSchema } from '../types';

const BinanceResponseSchema = z.object({
  symbol: z.string(),
  price: z.string(),
});

const BinanceResponseArraySchema = z.array(BinanceResponseSchema);

type BinanceResponse = z.infer<typeof BinanceResponseSchema>;

class BinancePriceSource extends PriceSource<BinanceResponse> {
  readonly id = 'binance';
  readonly baseUrl = 'https://api.binance.com/api/v3/ticker/price';
  readonly ResponseSchema = BinanceResponseSchema;
  readonly ResponseArraySchema = BinanceResponseArraySchema;

  readonly SupportTokenIdPair = new Map<TokenId, string>([
    /** ETH and its derivatives */
    [TOKEN_ID.ETH, 'ETHUSDT'],
    [TOKEN_ID.WETH, 'ETHUSDT'],
    [TOKEN_ID.eETH, 'ETHUSDT'],
    /** BTC and its derivatives */
    [TOKEN_ID.BTC, 'BTCUSDT'],
  ]);

  private async fetchPrices(symbols: Set<string>): Promise<BinanceResponse[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          symbols: JSON.stringify(Array.from(symbols)),
        },
      });

      return this.ResponseArraySchema.parse(response.data);
    } catch (error) {
      console.error('Failed to fetch prices from Binance:', error);
      return [];
    }
  }

  async getPrice(tokenSymbol: string): Promise<number | null> {
    try {
      const tokenId = TokenIdSchema.parse(tokenSymbol.toUpperCase());

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

      const [response] = await this.fetchPrices(new Set([pair]));
      if (!response) return null;

      const price = this.parsePrice(response.price);

      if (price !== null) {
        // Cache the price
        this.setCachedPrice(tokenSymbol, price);
      }

      return price;
    } catch (error) {
      console.error(
        `Failed to fetch price for ${tokenSymbol} from Binance:`,
        error,
      );
      return null;
    }
  }

  async getMultiplePrices(
    tokenSymbols: Set<string>,
  ): Promise<Map<string, number | null>> {
    const results = new Map<string, number | null>();
    const validPairs = new Set<string>();

    // First, validate all tokens and collect valid pairs
    for (const tokenSymbol of tokenSymbols) {
      try {
        const tokenId = TokenIdSchema.parse(tokenSymbol.toUpperCase());

        // Handle stable tokens
        if (this.isStableToken(tokenId)) {
          results.set(tokenSymbol, 1);
          continue;
        }

        // Check cache first
        const cachedPrice = this.getCachedPrice(tokenSymbol);
        if (cachedPrice !== null) {
          results.set(tokenSymbol, cachedPrice);
          continue;
        }

        const pair = this.SupportTokenIdPair.get(tokenId);
        if (pair) {
          validPairs.add(pair);
        } else {
          results.set(tokenSymbol, null);
        }
      } catch {
        results.set(tokenSymbol, null);
      }
    }

    if (validPairs.size === 0) {
      return results;
    }

    // Fetch prices for valid pairs that weren't in cache
    const responses = await this.fetchPrices(validPairs);
    const priceMap = new Map(
      responses.map((response) => [
        response.symbol,
        this.parsePrice(response.price),
      ]),
    );

    // Map the results back to original assets and update cache
    for (const asset of tokenSymbols) {
      try {
        const tokenId = TokenIdSchema.parse(asset.toUpperCase());

        // Skip stable tokens as they're already handled
        if (this.isStableToken(tokenId)) {
          continue;
        }

        const pair = this.SupportTokenIdPair.get(tokenId);
        if (pair) {
          const price = priceMap.get(pair) ?? null;
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

export const binancePriceSource = new BinancePriceSource();
