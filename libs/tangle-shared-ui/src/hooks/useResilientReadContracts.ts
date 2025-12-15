import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useConnectorClient, usePublicClient } from 'wagmi';
import type { PublicClient } from 'viem';
import {
  isNetworkishError,
  isZeroDataDecodeError,
  readContractsResilient,
  type ResilientCallResult,
  type ResilientContractCall,
} from '../utils/resilientEvmRead';

type Options = {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  retry?: number;
  retryDelay?: number;
};

type Params<TQueryKey extends readonly unknown[]> = {
  queryKey: TQueryKey;
  contracts: ResilientContractCall[];
  query?: Options;
};

const isRetryable = (error: unknown) =>
  isNetworkishError(error) || isZeroDataDecodeError(error);

const useResilientReadContracts = <TQueryKey extends readonly unknown[]>(
  params: Params<TQueryKey>,
): UseQueryResult<ResilientCallResult[], unknown> => {
  const publicClient = usePublicClient() as PublicClient | undefined;
  const { data: connectorClient } = useConnectorClient();

  const { queryKey, contracts, query } = params;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const results = await readContractsResilient(
        publicClient,
        connectorClient ?? null,
        contracts,
      );

      // If everything failed with retryable errors, throw so React Query can retry
      // and (if there was cached data) avoid clobbering the UI with empties.
      if (
        results.length > 0 &&
        results.every((r) => r.status === 'failure' && isRetryable(r.error))
      ) {
        throw new Error('Retryable contract read failure');
      }

      return results;
    },
    enabled: (query?.enabled ?? true) && contracts.length > 0,
    staleTime: query?.staleTime,
    refetchInterval: query?.refetchInterval,
    refetchIntervalInBackground: query?.refetchIntervalInBackground,
    retry: query?.retry ?? 2,
    retryDelay: query?.retryDelay ?? 300,
  });
};

export default useResilientReadContracts;
export { useResilientReadContracts };

