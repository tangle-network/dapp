// Standardized caching configuration for React Query hooks
// These provide consistent cache behavior across the application

export const CACHE_CONFIG = {
  // Static data that rarely changes (e.g., protocol constants, ABI data)
  STATIC: {
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Protocol configuration (e.g., delays, minimum amounts)
  PROTOCOL: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },

  // Asset/token data (enabled assets, metadata)
  ASSETS: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // User balances and positions - need to stay fresh
  BALANCES: {
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30s
  },

  // Operator/delegator data
  OPERATORS: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // Vault data (TVL, positions)
  VAULTS: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60s
  },

  // Health checks and connectivity
  HEALTH: {
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Check every 30s
  },
} as const;

export type CacheConfigKey = keyof typeof CACHE_CONFIG;
