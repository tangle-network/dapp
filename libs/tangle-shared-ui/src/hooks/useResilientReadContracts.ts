import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useConnectorClient, usePublicClient } from 'wagmi';
import {
  createPublicClient,
  custom,
  type Chain,
  type PublicClient,
} from 'viem';
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
  chainId?: number;
  query?: Options;
};

const isRetryable = (error: unknown) =>
  isNetworkishError(error) || isZeroDataDecodeError(error);

const makeFallbackChain = (chainId: number): Chain => ({
  id: chainId,
  name: `EVM ${chainId}`,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [] },
  },
});

type BrowserProvider = Parameters<typeof custom>[0] & {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: 'chainChanged', listener: (chainId: string) => void) => void;
  removeListener?: (
    event: 'chainChanged',
    listener: (chainId: string) => void,
  ) => void;
};

const useResilientReadContracts = <TQueryKey extends readonly unknown[]>(
  params: Params<TQueryKey>,
): UseQueryResult<ResilientCallResult[], unknown> => {
  const publicClient = usePublicClient({ chainId: params.chainId }) as
    | PublicClient
    | undefined;
  const { data: connectorClient } = useConnectorClient();
  const [browserChainId, setBrowserChainId] = useState<
    number | null | undefined
  >(undefined);
  const browserProvider =
    typeof window === 'undefined'
      ? undefined
      : (window as unknown as { ethereum?: BrowserProvider }).ethereum;

  const browserPublicClient = useMemo(() => {
    if (params.chainId === undefined) {
      return undefined;
    }

    if (!browserProvider) {
      return undefined;
    }

    return createPublicClient({
      chain: makeFallbackChain(params.chainId),
      transport: custom(browserProvider),
    }) as PublicClient;
  }, [browserProvider, params.chainId]);

  useEffect(() => {
    if (!browserProvider?.request) {
      setBrowserChainId(null);
      return;
    }

    let active = true;

    const setFromHex = (chainIdHex: unknown) => {
      if (!active || typeof chainIdHex !== 'string') {
        return;
      }

      const nextChainId = Number.parseInt(chainIdHex, 16);
      setBrowserChainId(Number.isFinite(nextChainId) ? nextChainId : null);
    };

    browserProvider
      .request({ method: 'eth_chainId' })
      .then(setFromHex)
      .catch(() => {
        if (active) {
          setBrowserChainId(null);
        }
      });

    const handleChainChanged = (chainIdHex: string) => setFromHex(chainIdHex);
    browserProvider.on?.('chainChanged', handleChainChanged);

    return () => {
      active = false;
      browserProvider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [browserProvider]);

  const { queryKey, contracts, query } = params;
  const isConnectedChain =
    params.chainId !== undefined &&
    (connectorClient?.chain?.id === params.chainId ||
      browserChainId === params.chainId);
  const readPublicClient = isConnectedChain
    ? (browserPublicClient ?? publicClient)
    : (publicClient ?? browserPublicClient);
  const hasResolvedBrowserChain = browserChainId !== undefined;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!readPublicClient && !connectorClient) {
        throw new Error('No read client available');
      }

      const results = await readContractsResilient(
        readPublicClient,
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
    enabled:
      (query?.enabled ?? true) &&
      contracts.length > 0 &&
      hasResolvedBrowserChain &&
      (!!readPublicClient || !!connectorClient),
    staleTime: query?.staleTime,
    refetchInterval: query?.refetchInterval,
    refetchIntervalInBackground: query?.refetchIntervalInBackground,
    retry: query?.retry ?? 2,
    retryDelay: query?.retryDelay ?? 300,
  });
};

export default useResilientReadContracts;
export { useResilientReadContracts };
