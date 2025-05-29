import { useActiveChain } from '@tangle-network/api-provider-environment/hooks/useActiveChain';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ReactQueryKey } from '../../constants/reactQuery';
import { LoggerService } from '@tangle-network/browser-utils';
import { BN } from '@polkadot/util';
import JSONParseBigInt from '@tangle-network/ui-components/utils/JSONParseBigInt';
import JSONStringifyBigInt from '@tangle-network/ui-components/utils/JSONStringifyBigInt';
import { z } from 'zod';

const logger = LoggerService.new('useCredits');

// This represents the structure of our credits data
export type CreditsData = {
  amount: BN;
};

export default function useCredits() {
  const activeSubstrateAddress = useSubstrateAddress(false);
  const { network } = useNetworkStore();
  const [activeChain] = useActiveChain();

  // Use archive RPC endpoint if available
  const overrideRpcEndpoint = useMemo(() => {
    const wsEndpoints = activeChain?.rpcUrls.default?.webSocket;

    if (wsEndpoints && wsEndpoints.length > 0) {
      return wsEndpoints[0];
    }

    return network?.archiveRpcEndpoint ?? network.wsRpcEndpoints[0];
  }, [
    activeChain?.rpcUrls.default?.webSocket,
    network?.archiveRpcEndpoint,
    network.wsRpcEndpoints,
  ]);

  const { data: creditsResponse, ...rest } = useQuery(
    getQueryOptions(overrideRpcEndpoint, activeSubstrateAddress),
  );

  const data = useMemo(() => {
    if (!creditsResponse) {
      return null;
    }

    if ('error' in creditsResponse) {
      logger.error('Failed to fetch credits', creditsResponse);
      return null;
    }

    return {
      amount: new BN(creditsResponse.result.toString()),
    };
  }, [creditsResponse]);

  return {
    data,
    ...rest,
  };
}

const responseSchema = z.union([
  z.object({
    id: z.number(),
    jsonrpc: z.string(),
    error: z.object({
      code: z.number(),
      message: z.string(),
      data: z.string().optional(),
    }),
  }),
  z.object({
    id: z.number(),
    jsonrpc: z.string(),
    result: z.bigint(),
  }),
]);

async function fetcher(rpcEndpoint: string, activeAddress: string | null) {
  if (!activeAddress) {
    return null;
  }

  try {
    // Change the protocol to http/https if it's not already
    const url = new URL(rpcEndpoint);
    url.protocol = url.protocol === 'ws:' ? 'http' : 'https';

    const body = JSONStringifyBigInt({
      id: 1,
      jsonrpc: '2.0',
      method: 'credits_queryUserCredits',
      params: [activeAddress],
    });

    const response = await fetch(url.toString(), {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: response.status,
          message: response.statusText,
        },
      } satisfies z.infer<typeof responseSchema>;
    }

    const parsed = JSONParseBigInt(await response.text());
    const result = responseSchema.safeParse(parsed);

    if (result.success === false) {
      const message =
        result.error.issues.length > 0
          ? result.error.issues[0].message
          : 'Failed to parse credits';

      return {
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: response.status,
          message,
        },
      } satisfies z.infer<typeof responseSchema>;
    }

    return result.data;
  } catch (error) {
    logger.error('Error fetching credits', error);
    throw error;
  }
}

export function getQueryOptions(
  rpcEndpoint: string,
  activeSubstrateAddress: string | null,
) {
  return queryOptions({
    queryKey: [ReactQueryKey.GetCredits, rpcEndpoint, activeSubstrateAddress],
    queryFn: () => fetcher(rpcEndpoint, activeSubstrateAddress),
    retry: 3,
    refetchInterval: 30000, // Refetch every 30 seconds
    placeholderData: (prev) => prev,
  });
}
