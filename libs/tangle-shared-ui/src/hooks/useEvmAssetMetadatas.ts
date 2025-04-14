import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { skipToken, useQuery } from '@tanstack/react-query';
import fetchErc20TokenMetadata from '../utils/fetchErc20TokenMetadata';
import useViemPublicClient from './useViemPublicClient';

export const useEvmAssetMetadatas = (
  evmAssetIds: EvmAddress[] | undefined | null,
) => {
  const viemPublicClient = useViemPublicClient();

  return useQuery({
    queryKey: ['evmAssetMetadatas', evmAssetIds, viemPublicClient?.chain?.id],
    queryFn:
      Array.isArray(evmAssetIds) &&
      evmAssetIds.length > 0 &&
      viemPublicClient?.chain?.id !== undefined
        ? () => fetchErc20TokenMetadata(viemPublicClient, evmAssetIds)
        : skipToken,
    // Never stale, no need to refetch.
    staleTime: Infinity,
  });
};
