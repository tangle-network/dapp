/**
 * Token metadata utilities and fallback cache.
 * Primary source is on-chain ERC20 calls, this provides fallback by symbol.
 *
 * IMPORTANT: All caches and lookups are chain-aware to prevent cross-chain
 * metadata collisions when users switch between networks.
 */

import EVMChainId from '@tangle-network/dapp-types/EVMChainId';
import { Address } from 'viem';

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

// Well-known token metadata by symbol (symbols are chain-agnostic)
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

// Known token addresses per chain: chainId -> lowercase address -> symbol
// Each chain has its own address-to-symbol mapping since the same address
// can represent different tokens on different chains.
const KNOWN_TOKEN_ADDRESSES: Partial<
  Record<EVMChainId, Record<string, string>>
> = {
  // Anvil Local (chain 31337) - deterministic addresses from tnt-core LocalTestnet.s.sol
  [EVMChainId.AnvilLocal]: {
    '0x0165878a594ca255338adfa4d48449f69242eb8f': 'TNT',
    '0x5eb3bc0a489c5a8288765d2336659ebca68fcd00': 'TNT',
    '0x809d550fca64d94bd9f66e60752a544199cfac3d': 'USDC',
    '0x367761085bf3c12e5da2df99ac6e1a824612b8fb': 'USDC',
    '0x4c5859f0f772848b2d91f1d83e2fe57935348029': 'USDT',
    '0x4c2f7092c2ae51d986befee378e50bd4db99c901': 'USDT',
    '0x1291be112d480055dafd8a610b7d1e203891c274': 'DAI',
    '0x7a9ec1d04904907de0ed7b6839ccdd59c3716ac9': 'DAI',
    '0x5f3f1dbd7b74c6b46e8c44f98792a1daf8d69154': 'WETH',
    '0x49fd2be640db2910c2fab69bb8531ab6e76127ff': 'WETH',
    '0xb7278a61aa25c888815afc32ad3cc52ff24fe575': 'stETH',
    '0x4631bcabd6df18d94796344963cb60d44a4136b6': 'stETH',
    '0xcd8a1c3ba11cf5ecfa6267617243239504a98d90': 'wstETH',
    '0x86a2ee8faf9a840f7a2c64ca3d51209f9a02081d': 'wstETH',
    '0x82e01223d51eb87e16a03e24687edf0f294da6f1': 'EIGEN',
    '0xa4899d35897033b927acfcf422bc745916139776': 'EIGEN',
  },
  // Base Sepolia (chain 84532) - addresses from tnt-core deployments
  [EVMChainId.BaseSepolia]: {
    '0xa9ffe787eea7f385dac8481cd8bdc3d9194aeb5a': 'TNT',
    '0x4a679253410272dd5232b3ff7cf5dbb88f295319': 'USDC',
    '0x7a2088a1bfc9d81c55368ae168c2c02570cb814f': 'USDT',
    '0x09635f643e140090a9a8dcd712ed6285858cebef': 'DAI',
    '0x67d269191c92caf3cd7723f116c85e6e9bf55933': 'stETH',
    '0xe6e340d132b5f46d1e472debcd681b2abc16e57e': 'wstETH',
    '0xc3e53f4d16ae77db1c982e75a937b9f60fe63690': 'EIGEN',
    '0xc5a5c42992decbae36851359345fe25997f5c42d': 'WETH',
  },
};

// Runtime cache: "chainId:address" -> metadata
// Populated from on-chain ERC20 fetches, keyed by chain to prevent cross-chain collisions
const metadataCache = new Map<string, TokenMetadata>();

/**
 * Build a cache key that includes chain ID to prevent cross-chain collisions.
 */
const buildCacheKey = (chainId: number, address: string): string =>
  `${chainId}:${address.toLowerCase()}`;

/**
 * Get token metadata by chain ID and address.
 * Checks runtime cache first, then known addresses for the specific chain.
 *
 * @param chainId - The EVM chain ID
 * @param address - The token contract address
 */
export const getCachedTokenMetadata = (
  chainId: number,
  address: Address,
): TokenMetadata | undefined => {
  const cacheKey = buildCacheKey(chainId, address);

  // Check runtime cache first
  const cached = metadataCache.get(cacheKey);
  if (cached) return cached;

  // Check known token addresses for this specific chain
  const chainAddresses = KNOWN_TOKEN_ADDRESSES[chainId as EVMChainId];
  if (chainAddresses) {
    const symbol = chainAddresses[address.toLowerCase()];
    if (symbol) {
      return KNOWN_TOKENS[symbol];
    }
  }

  return undefined;
};

/**
 * Cache token metadata after fetching from chain.
 * The cache is keyed by chainId:address to prevent cross-chain collisions.
 *
 * @param chainId - The EVM chain ID
 * @param address - The token contract address
 * @param metadata - The token metadata to cache
 */
export const cacheTokenMetadata = (
  chainId: number,
  address: Address,
  metadata: TokenMetadata,
): void => {
  metadataCache.set(buildCacheKey(chainId, address), metadata);
};
