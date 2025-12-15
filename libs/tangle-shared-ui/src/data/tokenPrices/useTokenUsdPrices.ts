import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useChainId } from 'wagmi';
import {
  fetchTokenUsdPrices,
  getTokenPriceOverrides,
  setTokenPriceOverrides,
  type TokenRef,
} from './fetchTokenUsdPrices';

/**
 * Address-based USD prices (with local overrides + public API fallbacks).
 *
 * Returns a Map keyed by lowercase token address.
 */
export function useTokenUsdPrices(tokens: TokenRef[] | null) {
  const chainId = useChainId();
  const didPersistRef = useRef(false);

  const query = useQuery({
    queryKey: [
      'tokenUsdPrices',
      chainId,
      ...(tokens?.map((t) => `${t.address.toLowerCase()}:${t.symbol ?? ''}`) ??
        []),
    ],
    queryFn: tokens
      ? () => fetchTokenUsdPrices({ chainId, tokens })
      : skipToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  // Local-dev quality of life: persist resolved prices to address-based overrides.
  // This makes local chains deterministic even when token addresses differ from public networks.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (didPersistRef.current) return;
    if (!tokens || !query.data) return;

    // Enable by default for anvil (31337); can be disabled with `VITE_AUTO_PRICE_OVERRIDES=false`.
    const rawFlag = (import.meta as any)?.env?.VITE_AUTO_PRICE_OVERRIDES;
    const autoEnabled =
      rawFlag === undefined ? chainId === 31337 : rawFlag !== 'false';
    if (!autoEnabled) return;

    const existing = getTokenPriceOverrides();
    const chainKey = String(chainId);
    const chainOverrides = existing[chainKey] ?? {};

    let changed = false;
    const nextChainOverrides = { ...chainOverrides } as Record<
      `0x${string}`,
      number
    >;

    for (const token of tokens) {
      const address = token.address.toLowerCase() as `0x${string}`;
      if (typeof nextChainOverrides[address] === 'number') continue;
      const price = query.data.get(address) ?? 1;
      nextChainOverrides[address] = price;
      changed = true;
    }

    if (changed) {
      setTokenPriceOverrides({
        ...existing,
        [chainKey]: nextChainOverrides,
      });
    }

    didPersistRef.current = true;
  }, [chainId, query.data, tokens]);

  return query;
}
