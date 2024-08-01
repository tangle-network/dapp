import {
  NETWORK_MAP,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback } from 'react';
import { z } from 'zod';

import testRpcEndpointConnection from '../components/NetworkSelector/testRpcEndpointConnection';
import { DEFAULT_NETWORK } from '../constants/networks';
import createCustomNetwork from '../utils/createCustomNetwork';
import useLocalStorage, { LocalStorageKey } from './useLocalStorage';

const useInitialNetwork = () => {
  const { refresh: getCachedCustomRpcEndpoint } = useLocalStorage(
    LocalStorageKey.CUSTOM_RPC_ENDPOINT,
  );

  const { refresh: getCachedNetworkId, remove: removeCachedNetworkId } =
    useLocalStorage(LocalStorageKey.KNOWN_NETWORK_ID);

  return useCallback(async () => {
    const cachedNetworkIdOpt = getCachedNetworkId();

    // If the cached network name is present, that indicates that
    // the cached network is a Webb network. Find it in the list of
    // all Webb networks, and return it.
    if (cachedNetworkIdOpt.value !== null) {
      const parsedNetworkId = z
        .nativeEnum(NetworkId)
        .safeParse(cachedNetworkIdOpt.value);

      if (parsedNetworkId.success) {
        const id = parsedNetworkId.data;
        const knownNetwork = NETWORK_MAP[id];

        const connectionEstablished = await testRpcEndpointConnection(
          knownNetwork.wsRpcEndpoint,
        );

        if (knownNetwork !== undefined && !connectionEstablished) {
          console.warn(
            `Could not connect to cached network: ${knownNetwork.name}, deleting from local storage and connecting to default network instead`,
          );

          removeCachedNetworkId();

          return DEFAULT_NETWORK;
        } else if (knownNetwork !== undefined) {
          return knownNetwork;
        }
      }

      console.warn(
        `Could not find an associated network for cached network id: ${cachedNetworkIdOpt.value}, deleting from local storage`,
      );

      removeCachedNetworkId();

      return DEFAULT_NETWORK;
    }

    const cachedCustomRpcEndpointOpt = getCachedCustomRpcEndpoint();

    return cachedCustomRpcEndpointOpt.value !== null
      ? // If a custom RPC endpoint is cached, return it as a custom network.
        createCustomNetwork(cachedCustomRpcEndpointOpt.value)
      : // Otherwise, use the default network.
        DEFAULT_NETWORK;
  }, [getCachedCustomRpcEndpoint, getCachedNetworkId, removeCachedNetworkId]);
};

export default useInitialNetwork;
