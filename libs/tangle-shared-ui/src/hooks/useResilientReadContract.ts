import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useConnectorClient, usePublicClient } from 'wagmi';
import type { PublicClient } from 'viem';
import {
  isNetworkishError,
  isZeroDataDecodeError,
  readContractResilient,
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
  contract: ResilientContractCall | null;
  query?: Options;
};

const isRetryable = (error: unknown) =>
  isNetworkishError(error) || isZeroDataDecodeError(error);

const useResilientReadContract = <TQueryKey extends readonly unknown[]>(
  params: Params<TQueryKey>,
): UseQueryResult<unknown, unknown> => {
  const publicClient = usePublicClient() as PublicClient | undefined;
  const { data: connectorClient } = useConnectorClient();

  const { queryKey, contract, query } = params;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      if (!contract) {
        return null;
      }

      try {
        return await readContractResilient(
          publicClient,
          connectorClient ?? null,
          contract,
        );
      } catch (error) {
        if (isRetryable(error)) {
          throw error;
        }
        throw error;
      }
    },
    enabled: (query?.enabled ?? true) && contract !== null,
    staleTime: query?.staleTime,
    refetchInterval: query?.refetchInterval,
    refetchIntervalInBackground: query?.refetchIntervalInBackground,
    retry: query?.retry ?? 2,
    retryDelay: query?.retryDelay ?? 300,
  });
};

export default useResilientReadContract;
export { useResilientReadContract };
