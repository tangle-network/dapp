import {
  Network,
  NETWORK_MAP,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback } from 'react';
import { z } from 'zod';

import testRpcEndpointConnection from '../components/NetworkSelector/testRpcEndpointConnection';
import { DEFAULT_NETWORK } from '../constants/networks';
import createCustomNetwork from '../utils/createCustomNetwork';
import useLocalStorage, { LocalStorageKey } from './useLocalStorage';

const useCachedNetworkId = (): ((
  cachedNetworkId: number,
) => Promise<Network>) => {
  const { remove: removeCachedNetworkId } = useLocalStorage(
    LocalStorageKey.KNOWN_NETWORK_ID,
  );

  return useCallback(
    async (cachedNetworkId: number) => {
      // If there is a cached network id, check if it is a known network.
      const parsedNetworkId = z
        .nativeEnum(NetworkId)
        .safeParse(cachedNetworkId);

      if (!parsedNetworkId.success) {
        console.warn(
          `Cached network id appears to be invalid: ${cachedNetworkId}, deleting from local storage`,
        );

        removeCachedNetworkId();

        return DEFAULT_NETWORK;
      }

      const id = parsedNetworkId.data;
      const knownNetwork = NETWORK_MAP[id];

      if (knownNetwork === undefined) {
        console.warn(
          `Could not find an associated network for cached network id: ${id}, deleting from local storage`,
        );

        removeCachedNetworkId();

        return DEFAULT_NETWORK;
      }

      const connectionEstablished = await testRpcEndpointConnection(
        knownNetwork.wsRpcEndpoint,
      );

      if (!connectionEstablished) {
        console.warn(
          `Could not connect to cached network: ${knownNetwork.name}, deleting from local storage and connecting to default network instead`,
        );

        removeCachedNetworkId();

        return DEFAULT_NETWORK;
      }

      return knownNetwork;
    },
    [removeCachedNetworkId],
  );
};

const useCachedCustomRpcEndpoint = (): ((
  cachedCustomRpcEndpoint: string,
) => Promise<Network>) => {
  const { remove: removeCachedCustomRpcEndpoint } = useLocalStorage(
    LocalStorageKey.CUSTOM_RPC_ENDPOINT,
  );

  return useCallback(
    async (cachedCustomRpcEndpoint: string) => {
      const connectionEstablished = await testRpcEndpointConnection(
        cachedCustomRpcEndpoint,
      );

      if (!connectionEstablished) {
        console.warn(
          `Could not connect to cached custom RPC endpoint: ${cachedCustomRpcEndpoint}, deleting from local storage`,
        );

        removeCachedCustomRpcEndpoint();

        return DEFAULT_NETWORK;
      }

      return createCustomNetwork(cachedCustomRpcEndpoint);
    },
    [removeCachedCustomRpcEndpoint],
  );
};

const useInitialNetwork = () => {
  const { refresh: getCachedCustomRpcEndpoint } = useLocalStorage(
    LocalStorageKey.CUSTOM_RPC_ENDPOINT,
  );

  const { refresh: getCachedNetworkId } = useLocalStorage(
    LocalStorageKey.KNOWN_NETWORK_ID,
  );

  const getCustomNetwork = useCachedCustomRpcEndpoint();
  const getKnownNetwork = useCachedNetworkId();

  return useCallback(async () => {
    const cachedCustomRpcEndpointOpt = getCachedCustomRpcEndpoint();
    const cachedNetworkIdOpt = getCachedNetworkId();

    // If there is a cached custom RPC endpoint, return it as a custom network.
    // If there is a cached network id, check if it is a known network.
    // Otherwise, return the default network.
    return cachedCustomRpcEndpointOpt.value !== null
      ? getCustomNetwork(cachedCustomRpcEndpointOpt.value)
      : cachedNetworkIdOpt.value !== null
        ? getKnownNetwork(cachedNetworkIdOpt.value)
        : DEFAULT_NETWORK;
  }, [
    getCachedCustomRpcEndpoint,
    getCachedNetworkId,
    getCustomNetwork,
    getKnownNetwork,
  ]);
};

export default useInitialNetwork;
