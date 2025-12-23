import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import fetchErc20TokenMetadata from '../utils/fetchErc20TokenMetadata';
import useViemPublicClient from './useViemPublicClient';

type TokenMetadata = {
  id: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
};

const NATIVE_TOKEN_ADDRESS = zeroAddress.toLowerCase();
const DEFAULT_CHAIN_ID = 1; // Fallback to Ethereum mainnet if chain ID unavailable

const buildFallbackMetadata = (
  chainId: number,
  id: EvmAddress,
): TokenMetadata => {
  const cached = getCachedTokenMetadata(chainId, id);
  if (cached) {
    return { id, ...cached };
  }

  return {
    id,
    name: `Token ${id.slice(0, 8)}...`,
    symbol: `${id.slice(0, 6)}...${id.slice(-4)}`,
    decimals: 18,
  };
};

export const useEvmAssetMetadatas = (
  evmAssetIds: EvmAddress[] | undefined | null,
) => {
  const viemPublicClient = useViemPublicClient();

  return useQuery({
    queryKey: ['evmAssetMetadatas', evmAssetIds, viemPublicClient?.chain?.id],
    queryFn: async () => {
      if (!Array.isArray(evmAssetIds) || evmAssetIds.length === 0) {
        return [];
      }

      // Preserve original order but de-duplicate by lowercase address.
      const ids: EvmAddress[] = [];
      const seen = new Set<string>();
      for (const id of evmAssetIds) {
        const normalized = id.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        ids.push(id);
      }

      const hasNative = ids.some(
        (id) => id.toLowerCase() === NATIVE_TOKEN_ADDRESS,
      );
      const erc20Ids = ids.filter(
        (id) => id.toLowerCase() !== NATIVE_TOKEN_ADDRESS,
      );

      let fetched: TokenMetadata[] = [];
      if (viemPublicClient && erc20Ids.length > 0) {
        try {
          fetched = await fetchErc20TokenMetadata(viemPublicClient, erc20Ids);
        } catch (error) {
          // Metadata should never be a blocking failure for the UI; fall back to cached/derived values.
          console.warn(
            '[useEvmAssetMetadatas] Failed to fetch token metadata',
            {
              chainId: viemPublicClient.chain?.id,
              error,
            },
          );
          fetched = [];
        }
      }

      const fetchedByLower = new Map<string, TokenMetadata>();
      for (const md of fetched) {
        fetchedByLower.set(md.id.toLowerCase(), md);
      }

      const nativeCurrency = viemPublicClient?.chain?.nativeCurrency;
      const nativeMetadata: TokenMetadata | null = hasNative
        ? {
            id: zeroAddress as EvmAddress,
            name: nativeCurrency?.name ?? 'Native Token',
            symbol: nativeCurrency?.symbol ?? 'ETH',
            decimals: nativeCurrency?.decimals ?? 18,
          }
        : null;

      const chainId = viemPublicClient?.chain?.id ?? DEFAULT_CHAIN_ID;

      return ids.map((id) => {
        if (id.toLowerCase() === NATIVE_TOKEN_ADDRESS) {
          return nativeMetadata ?? buildFallbackMetadata(chainId, id);
        }

        return (
          fetchedByLower.get(id.toLowerCase()) ??
          buildFallbackMetadata(chainId, id)
        );
      });
    },
    enabled: Array.isArray(evmAssetIds) && evmAssetIds.length > 0,
    // Never stale, no need to refetch.
    staleTime: Infinity,
  });
};
