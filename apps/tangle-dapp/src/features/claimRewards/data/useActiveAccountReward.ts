import { useActiveChain } from '@tangle-network/api-provider-environment/hooks/useActiveChain';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import createAssetIdEnum from '@tangle-network/tangle-shared-ui/utils/createAssetIdEnum';
import createRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/createRestakeAssetId';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import JSONParseBigInt from '@tangle-network/ui-components/utils/JSONParseBigInt';
import JSONStringifyBigInt from '@tangle-network/ui-components/utils/JSONStringifyBigInt';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';
import { ReactQueryKey } from '../../../constants/reactQuery';
import useActiveDelegation from '../../../data/restake/useActiveDelegation';
import { LoggerService } from '@tangle-network/browser-utils';

const logger = LoggerService.new('useActiveAccountReward');

export default function useActiveAccountReward() {
  const activeSubstrateAddress = useSubstrateAddress(false);
  const { result: activeDelegation } = useActiveDelegation();

  const { network } = useNetworkStore();
  const [activeChain] = useActiveChain();

  const overrideRpcEndpoint = useMemo(() => {
    const wsEndpoints = activeChain?.rpcUrls.default?.webSocket;

    if (wsEndpoints && wsEndpoints.length > 0) {
      return wsEndpoints[0];
    }

    return network?.archiveRpcEndpoint ?? network.wsRpcEndpoint;
  }, [
    activeChain?.rpcUrls.default?.webSocket,
    network?.archiveRpcEndpoint,
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

  const { data: rewardsResponse, ...rest } = useQuery(
    getQueryOptions(overrideRpcEndpoint, activeSubstrateAddress, assetIds),
  );

  const data = useMemo(() => {
    if (!rewardsResponse) {
      return;
    }

    return assetIds.reduce((acc, current, idx) => {
      const resp = rewardsResponse[idx];

      if ('error' in resp) {
        logger.error(`Failed to fetch rewards for asset ${current}`, resp);
        return acc;
      }

      acc.set(current, resp.result);

      return acc;
    }, new Map<RestakeAssetId, bigint>());
  }, [assetIds, rewardsResponse]);

  return {
    data,
    ...rest,
  };
}

export function getQueryOptions(
  overrideRpcEndpoint: string,
  activeSubstrateAddress: SubstrateAddress | null,
  assetIds: RestakeAssetId[],
) {
  return queryOptions({
    queryKey: [
      ReactQueryKey.GetAccountRewards,
      overrideRpcEndpoint,
      activeSubstrateAddress,
      assetIds,
    ],
    queryFn: () =>
      fetcher(overrideRpcEndpoint, activeSubstrateAddress, assetIds),
    retry: 10,
    refetchInterval: 6000,
    placeholderData: (prev) => prev,
  });
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

async function fetcher(
  rpcEndpoint: string,
  activeAddress: SubstrateAddress | null,
  assetIds: RestakeAssetId[],
) {
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
