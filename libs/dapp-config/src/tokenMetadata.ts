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
// These are deterministic when Anvil starts fresh (nonce 0) and broadcast cache is cleared
// Addresses from tnt-core LocalTestnet.s.sol deployment (chain ID 31337)
const KNOWN_TOKEN_ADDRESSES: Record<string, string> = {
  '0x0165878a594ca255338adfa4d48449f69242eb8f': 'TNT',
  '0x809d550fca64d94bd9f66e60752a544199cfac3d': 'USDC',
  '0x4c5859f0f772848b2d91f1d83e2fe57935348029': 'USDT',
  '0x1291be112d480055dafd8a610b7d1e203891c274': 'DAI',
  '0x5f3f1dbd7b74c6b46e8c44f98792a1daf8d69154': 'WETH',
  '0xb7278a61aa25c888815afc32ad3cc52ff24fe575': 'stETH',
  '0xcd8a1c3ba11cf5ecfa6267617243239504a98d90': 'wstETH',
  '0x82e01223d51eb87e16a03e24687edf0f294da6f1': 'EIGEN',
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
