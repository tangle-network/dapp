import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import createRestakeAssetId from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import createServiceAsset from '@webb-tools/tangle-shared-ui/utils/createServiceAsset';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import JSONParseBigInt from '@webb-tools/webb-ui-components/utils/JSONParseBigInt';
import JSONStringifyBigInt from '@webb-tools/webb-ui-components/utils/JSONStringifyBigInt';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';
import useActiveDelegation from '../restake/useActiveDelegation';

export default function useAccountRewardInfo() {
  const activeSubstrateAddress = useSubstrateAddress();
  const activeDelegation = useActiveDelegation();

  const { rpcEndpoint } = useNetworkStore();
  const [activeChain] = useActiveChain();

  const overrideRpcEndpoint = useMemo(() => {
    if (activeChain?.rpcUrls.default?.webSocket === undefined) {
      return undefined;
    }

    return activeChain.rpcUrls.default.webSocket.length > 0
      ? activeChain.rpcUrls.default.webSocket[0]
      : undefined;
  }, [activeChain?.rpcUrls.default?.webSocket]);

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
    useMemo(
      () => [
        overrideRpcEndpoint ?? rpcEndpoint,
        activeSubstrateAddress,
        assetIds,
      ],
      [activeSubstrateAddress, assetIds, overrideRpcEndpoint, rpcEndpoint],
    ),
    fetcher,
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
      data: z.string(),
      message: z.string(),
    }),
  }),
  z.object({
    id: z.number(),
    jsonrpc: z.string(),
    result: z.bigint(),
  }),
]);

async function fetcher([rpcEndpoint, activeAddress, assetIds]: [
  string,
  SubstrateAddress | null,
  RestakeAssetId[],
]) {
  if (activeAddress === null) {
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
        params: [activeAddress, createServiceAsset(assetId)],
      });

      const response = await fetch(url.toString(), {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rewards for ${assetId}`);
      }

      const parsed = JSONParseBigInt(await response.text());

      return responseSchema.parse(parsed);
    }),
  );

  return results;
}
