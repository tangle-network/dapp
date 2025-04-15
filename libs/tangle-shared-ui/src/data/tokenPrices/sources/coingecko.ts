import axios from 'axios';
import { z } from 'zod';
import { PriceSource, TOKEN_ID, TokenId, TokenIdSchema } from '../types';

const CoinGeckoResponseSchema = z.record(
  z.string(),
  z.object({
    usd: z.number(),
    usd_24h_change: z.number(),
  }),
);

type CoinGeckoResponse = z.infer<typeof CoinGeckoResponseSchema>;

class CoinGeckoPriceSource extends PriceSource<CoinGeckoResponse> {
  readonly id = 'coingecko';
  readonly baseUrl = 'https://api.coingecko.com/api/v3/simple/price';
  readonly ResponseSchema = CoinGeckoResponseSchema;

  readonly SupportTokenIdPair = new Map<TokenId, string>([
    /** ETH and its derivatives */
    [TOKEN_ID.ETH, 'ethereum'],
    [TOKEN_ID.WETH, 'weth'],
    [TOKEN_ID.wstETH, 'wrapped-steth'],
    [TOKEN_ID.rETH, 'rocket-pool-eth'],
    [TOKEN_ID.swETH, 'sweth'],
    [TOKEN_ID.mETH, 'mantle-staked-ether'],
    [TOKEN_ID.ezETH, 'renzo-restaked-eth'],
    [TOKEN_ID.eETH, 'ether-fi-staked-eth'],
    [TOKEN_ID.cbETH, 'coinbase-wrapped-staked-eth'],
    /** BTC and its derivatives */
    [TOKEN_ID.BTC, 'bitcoin'],
    [TOKEN_ID.tBTC, 'tbtc'],
    [TOKEN_ID.solvBTC, 'solv-btc'],
    [TOKEN_ID['solvBTC.BBN'], 'solv-btc'], // Use same token ID as solvBTC
    [TOKEN_ID.LBTC, 'lombard-staked-btc'],
    [TOKEN_ID.eBTC, 'ether-fi-staked-btc'],
    [TOKEN_ID.cbBTC, 'coinbase-wrapped-btc'],
  ]);

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

      const response = await axios.get(this.baseUrl, {
        params: {
          ids: pair,
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
      });

      const data = this.ResponseSchema.parse(response.data);
      const price = data[pair]?.usd;

      if (price === undefined || !Number.isFinite(price)) {
        throw new Error('Price must be a valid finite number');
      }

      // Cache the price
      this.setCachedPrice(tokenSymbol, price);

      return price;
    } catch (error) {
      console.error(
        `Failed to fetch price for ${tokenSymbol} from CoinGecko:`,
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
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ids: Array.from(validPairs).join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
      });

      const data = this.ResponseSchema.parse(response.data);

      // Map the results back to original assets and update cache
      for (const asset of tokenSymbols) {
        try {
          const tokenId = TokenIdSchema.parse(asset.toUpperCase());
          const pair = this.SupportTokenIdPair.get(tokenId);

          if (pair) {
            const price = data[pair]?.usd;
            if (Number.isFinite(price)) {
              results.set(asset, price);
              this.setCachedPrice(asset, price);
            } else {
              results.set(asset, null);
            }
          }
        } catch {
          // Already set to null in the first pass
        }
      }
    } catch (error) {
      console.error('Failed to fetch prices from CoinGecko:', error);
    }

    return results;
  }
}

export const coingeckoPriceSource = new CoinGeckoPriceSource();
