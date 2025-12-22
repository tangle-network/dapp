/**
 * Token metadata utilities and fallback cache.
 * Primary source is on-chain ERC20 calls, this provides fallback by symbol.
 */

import { Address } from 'viem';

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

// Well-known token metadata by symbol
const KNOWN_TOKENS: Record<string, TokenMetadata> = {
  ETH: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  TNT: { name: 'Tangle Network Token', symbol: 'TNT', decimals: 18 },
  USDC: { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  USDT: { name: 'Tether USD', symbol: 'USDT', decimals: 6 },
  DAI: { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
  WETH: { name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
  stETH: { name: 'Lido Staked ETH', symbol: 'stETH', decimals: 18 },
  wstETH: { name: 'Wrapped stETH', symbol: 'wstETH', decimals: 18 },
  EIGEN: { name: 'Eigenlayer', symbol: 'EIGEN', decimals: 18 },
  rETH: { name: 'Rocket Pool ETH', symbol: 'rETH', decimals: 18 },
  cbETH: { name: 'Coinbase Wrapped Staked ETH', symbol: 'cbETH', decimals: 18 },
  swETH: { name: 'Swell ETH', symbol: 'swETH', decimals: 18 },
};

// Known token addresses -> symbol mapping (from local Anvil deployment)
// These addresses are from the current tnt-core deployments
const KNOWN_TOKEN_ADDRESSES: Record<string, string> = {
  // TNT (bond asset) from tnt-core LocalTestnetSetup (Anvil 31337)
  '0x0165878a594ca255338adfa4d48449f69242eb8f': 'TNT',
  // TNT (Base Sepolia)
  '0xa9ffe787eea7f385dac8481cd8bdc3d9194aeb5a': 'TNT',
  '0x4a679253410272dd5232b3ff7cf5dbb88f295319': 'USDC',
  '0x7a2088a1bfc9d81c55368ae168c2c02570cb814f': 'USDT',
  '0x09635f643e140090a9a8dcd712ed6285858cebef': 'DAI',
  '0x67d269191c92caf3cd7723f116c85e6e9bf55933': 'stETH',
  '0xe6e340d132b5f46d1e472debcd681b2abc16e57e': 'wstETH',
  '0xc3e53f4d16ae77db1c982e75a937b9f60fe63690': 'EIGEN',
  '0xc5a5c42992decbae36851359345fe25997f5c42d': 'WETH',
};

// Runtime cache: address -> metadata (populated from on-chain fetches)
const metadataCache = new Map<string, TokenMetadata>();

/**
 * Get token metadata by symbol (case-insensitive).
 */
export const getTokenBySymbol = (symbol: string): TokenMetadata | undefined => {
  return KNOWN_TOKENS[symbol] ?? KNOWN_TOKENS[symbol.toUpperCase()];
};

/**
 * Get token metadata by address - checks runtime cache then known addresses.
 */
export const getCachedTokenMetadata = (
  address: Address,
): TokenMetadata | undefined => {
  const normalized = address.toLowerCase();

  // Check runtime cache first
  const cached = metadataCache.get(normalized);
  if (cached) return cached;

  // Check known token addresses
  const symbol = KNOWN_TOKEN_ADDRESSES[normalized];
  if (symbol) {
    return KNOWN_TOKENS[symbol];
  }

  return undefined;
};

/**
 * Cache token metadata after fetching from chain.
 */
export const cacheTokenMetadata = (
  address: Address,
  metadata: TokenMetadata,
): void => {
  metadataCache.set(address.toLowerCase(), metadata);
};

/**
 * Try to resolve token metadata from cache or known tokens.
 * Returns undefined if not found - caller should fetch from chain.
 */
export const resolveTokenMetadata = (
  address: Address,
  symbol?: string,
): TokenMetadata | undefined => {
  // Check address cache first
  const cached = getCachedTokenMetadata(address);
  if (cached) return cached;

  // Try symbol lookup if provided
  if (symbol) {
    const bySymbol = getTokenBySymbol(symbol);
    if (bySymbol) {
      cacheTokenMetadata(address, bySymbol);
      return bySymbol;
    }
  }

  return undefined;
};

// Legacy exports for backward compatibility
export type LocalTokenConfig = TokenMetadata & { address: Address };
export const getKnownTokenMetadata = getCachedTokenMetadata;
export const getTokenMetadataBySymbol = getTokenBySymbol;
