import { useActiveChain } from '@tangle-network/api-provider-environment/hooks/useActiveChain';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import createAssetIdEnum from '@tangle-network/tangle-shared-ui/utils/createAssetIdEnum';
import createRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/createRestakeAssetId';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import JSONParseBigInt from '@tangle-network/ui-components/utils/JSONParseBigInt';
import JSONStringifyBigInt from '@tangle-network/ui-components/utils/JSONStringifyBigInt';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';
import useActiveDelegation from '../restake/useActiveDelegation';
import { SWRKey } from './../../constants/swr';

export default function useAccountRewardInfo() {
  const activeSubstrateAddress = useSubstrateAddress(false);
  const activeDelegation = useActiveDelegation();

  const { network } = useNetworkStore();
  const [activeChain] = useActiveChain();

  const overrideRpcEndpoint = useMemo(() => {
    const wsEndpoints = activeChain?.rpcUrls.default?.webSocket;

    if (wsEndpoints && wsEndpoints.length > 0) {
      return wsEndpoints[0];
    }

    return network.archiveRpcEndpoint ?? network.wsRpcEndpoint;
  }, [
    activeChain?.rpcUrls.default?.webSocket,
    network.archiveRpcEndpoint,
    network.wsRpcEndpoint,
  ]);

  const assetIds = useMemo(() => {
    if (activeDelegation === null) {
      return [];
    }

    return activeDelegation.deposits
      .entries()
      .map(([assetId]) => createRestakeAssetId(assetId))
      .toArray();
  }, [activeDelegation]);

  const {
    data,
    isLoading,
    error: swrError,
    mutate,
  } = useSWR(
    [
      SWRKey.GetAccountRewards,
      overrideRpcEndpoint,
      activeSubstrateAddress,
      assetIds,
    ],
    fetcher,
    {
      shouldRetryOnError: false,
      refreshInterval: 5000,
    },
  );

  const result = useMemo(() => {
    if (!data) {
      return null;
    }

    return assetIds.reduce((acc, current, idx) => {
      const resp = data[idx];

      if ('error' in resp) {
        return acc;
      }

      acc.set(current, resp.result);

      return acc;
    }, new Map<RestakeAssetId, bigint>());
  }, [assetIds, data]);

  const error = useMemo(() => {
    if (swrError) {
      return ensureError(swrError);
    }

    return null;
  }, [swrError]);

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    result,
    refetch,
    isLoading,
    error,
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

async function fetcher([, rpcEndpoint, activeAddress, assetIds]: [
  SWRKey,
  string,
  SubstrateAddress | null,
  RestakeAssetId[],
]) {
  if (activeAddress === null || assetIds.length === 0) {
    return null;
  }

  const results = await Promise.all(
    assetIds.map(async (assetId) => {
      // Change the protocol to http/https if it's not already
      const url = new URL(rpcEndpoint);
      url.protocol = url.protocol === 'ws:' ? 'http' : 'https';

      const body = JSONStringifyBigInt({
        id: 1,
        jsonrpc: '2.0',
        method: 'rewards_queryUserRewards',
        params: [activeAddress, createAssetIdEnum(assetId)],
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
            : 'Failed to parse rewards';

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
    }),
  );

  return results;
}
