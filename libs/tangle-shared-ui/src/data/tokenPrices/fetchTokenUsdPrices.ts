import axios from 'axios';
import { z } from 'zod';
import { fetchTokenPrices } from './fetchTokenPrices';

export type TokenRef = {
  address: `0x${string}`;
  symbol?: string | null;
};

export type TokenPriceOverrides = Record<
  string,
  Record<`0x${string}`, number>
>;

const TOKEN_PRICE_OVERRIDES_STORAGE_KEY = 'token-price-overrides';

const tokenPriceOverridesSchema = z.record(
  z.string(),
  z.record(z.string(), z.number()),
);

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const readOverridesFromStorage = (): TokenPriceOverrides => {
  const storage = getLocalStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(TOKEN_PRICE_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    return tokenPriceOverridesSchema.parse(JSON.parse(raw)) as TokenPriceOverrides;
  } catch {
    return {};
  }
};

const readOverridesFromEnv = (): TokenPriceOverrides => {
  try {
    const viteEnv = (import.meta as any)?.env as Record<string, unknown> | undefined;
    const raw = viteEnv?.VITE_TOKEN_PRICE_OVERRIDES;
    if (typeof raw !== 'string' || raw.trim() === '') return {};
    return tokenPriceOverridesSchema.parse(JSON.parse(raw)) as TokenPriceOverrides;
  } catch {
    return {};
  }
};

export const getTokenPriceOverrides = (): TokenPriceOverrides => {
  // Env overrides win over localStorage.
  return {
    ...readOverridesFromStorage(),
    ...readOverridesFromEnv(),
  };
};

export const setTokenPriceOverrides = (overrides: TokenPriceOverrides) => {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(TOKEN_PRICE_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
};

const COINGECKO_PLATFORM_BY_CHAIN_ID: Record<number, string> = {
  1: 'ethereum',
  8453: 'base',
  42161: 'arbitrum-one',
  10: 'optimistic-ethereum',
  137: 'polygon-pos',
};

const CoingeckoTokenPriceSchema = z.record(
  z.string(),
  z.object({ usd: z.number().optional() }),
);

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/**
 * Fetch token USD prices keyed by token address.
 *
 * Priority:
 * 1) Local overrides (env/localStorage) by chainId + address
 * 2) CoinGecko contract-address pricing (for supported public chains)
 * 3) CoinGecko/Binance/Coinbase symbol-based sources (best-effort)
 * 4) Default `$1.00` for unknown assets
 */
export async function fetchTokenUsdPrices(params: {
  chainId: number;
  tokens: TokenRef[];
}): Promise<Map<`0x${string}`, number>> {
  const { chainId, tokens } = params;

  const overrides = getTokenPriceOverrides();
  const chainOverrides = overrides[String(chainId)] ?? {};

  const results = new Map<`0x${string}`, number>();
  const remaining: TokenRef[] = [];

  for (const token of tokens) {
    const address = token.address.toLowerCase() as `0x${string}`;
    const override = chainOverrides[address];
    if (typeof override === 'number' && Number.isFinite(override) && override > 0) {
      results.set(address, override);
    } else {
      remaining.push({ ...token, address });
    }
  }

  // CoinGecko contract-address pricing (won't work for local/dev chains).
  const platform = COINGECKO_PLATFORM_BY_CHAIN_ID[chainId] ?? null;
  if (platform && remaining.length > 0) {
    const batches = chunk(
      Array.from(new Set(remaining.map((t) => t.address))),
      100,
    );

    for (const batch of batches) {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/token_price/${encodeURIComponent(platform)}`,
          {
            params: {
              contract_addresses: batch.join(','),
              vs_currencies: 'usd',
            },
          },
        );

        const parsed = CoingeckoTokenPriceSchema.parse(response.data);
        for (const [addr, data] of Object.entries(parsed)) {
          const address = addr.toLowerCase() as `0x${string}`;
          const usd = data.usd;
          if (typeof usd === 'number' && Number.isFinite(usd) && usd > 0) {
            results.set(address, usd);
          }
        }
      } catch {
        // Ignore and continue to symbol fallback.
      }
    }
  }

  const stillMissing = remaining.filter(
    (t) => !results.has(t.address.toLowerCase() as `0x${string}`),
  );

  // Symbol-based fallback (CoinGecko/Binance/Coinbase), then default to $1.
  if (stillMissing.length > 0) {
    const symbolSet = new Set(
      stillMissing
        .map((t) => t.symbol?.trim())
        .filter((s): s is string => Boolean(s))
        .map((s) => s.toUpperCase()),
    );

    const symbolPrices = symbolSet.size > 0 ? await fetchTokenPrices(symbolSet) : new Map();

    for (const token of stillMissing) {
      const address = token.address.toLowerCase() as `0x${string}`;
      const symbol = token.symbol?.toUpperCase() ?? null;
      const price = symbol ? (symbolPrices.get(symbol) ?? null) : null;
      results.set(address, typeof price === 'number' && Number.isFinite(price) && price > 0 ? price : 1);
    }
  }

  // Ensure every requested token has an entry.
  for (const token of tokens) {
    const address = token.address.toLowerCase() as `0x${string}`;
    if (!results.has(address)) {
      results.set(address, 1);
    }
  }

  return results;
}
