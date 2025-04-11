import indexOf from 'lodash/indexOf';
import { z } from 'zod';

/**
 * Token IDs that are supported by the price sources.
 * Uppercase all values for consistency and support
 * case-insensitive token IDs.
 */
export const TOKEN_ID = {
  USDC: 'USDC',
  USDT: 'USDT',
  /** ETH and its derivatives */
  ETH: 'ETH',
  WETH: 'WETH',
  wstETH: 'WSTETH',
  rETH: 'RETH',
  swETH: 'SWETH',
  mETH: 'METH',
  ezETH: 'EZETH',
  eETH: 'EETH',
  cbETH: 'CBETH',
  /** BTC and its derivatives */
  BTC: 'BTC',
  tBTC: 'TBTC',
  solvBTC: 'SOLVBTC',
  'solvBTC.BBN': 'SOLVBTC.BBN',
  LBTC: 'LBTC',
  eBTC: 'EBTC',
  cbBTC: 'CBBTC',
} as const;

export type TokenId = (typeof TOKEN_ID)[keyof typeof TOKEN_ID];

export const TokenIdSchema = z.nativeEnum(TOKEN_ID);

export const STABLE_TOKEN_IDS = [TOKEN_ID.USDC, TOKEN_ID.USDT] as const;

export abstract class PriceSource<TValue> {
  abstract readonly id: string;

  abstract readonly baseUrl: string;

  abstract readonly SupportTokenIdPair: Map<TokenId, string>;

  abstract readonly ResponseSchema: z.Schema<TValue>;

  protected cache = new Map<string, { price: number; timestamp: number }>();

  // 5 minutes
  protected cacheTTL: number = 5 * 60 * 1000;

  abstract getPrice(asset: string): Promise<number | null>;

  abstract getMultiplePrices(
    assets: string[],
  ): Promise<Map<string, number | null>>;

  protected isStableToken(
    tokenId: TokenId,
  ): tokenId is (typeof STABLE_TOKEN_IDS)[number] {
    return indexOf(STABLE_TOKEN_IDS, tokenId) !== -1;
  }

  protected parsePrice(priceStr: string): number | null {
    const priceNumber = Number(priceStr);
    if (Number.isNaN(priceNumber) || !Number.isFinite(priceNumber)) {
      return null;
    }
    return priceNumber;
  }

  protected getCachedPrice(tokenSymbol: string): number | null {
    const cached = this.cache.get(tokenSymbol.toUpperCase());
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.price;
    }
    return null;
  }

  protected setCachedPrice(tokenSymbol: string, price: number) {
    this.cache.set(tokenSymbol.toUpperCase(), {
      price,
      timestamp: Date.now(),
    });
  }
}
