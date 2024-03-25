import { notificationApi } from '@webb-tools/webb-ui-components';
import { Network } from '@webb-tools/webb-ui-components/constants';
import { useCallback, useEffect, useState } from 'react';

import { ALL_WEBB_NETWORKS, DEFAULT_NETWORK } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import createCustomNetwork from '../utils/createCustomNetwork';
import useLocalStorage, { LocalStorageKey } from './useLocalStorage';

const useNetworkState = () => {
  const { network, setNetwork } = useNetworkStore();
  const [isCustom, setIsCustom] = useState(false);

  const {
    get: getCachedCustomRpcEndpoint,
    set: setCachedCustomRpcEndpoint,
    remove: removeCachedCustomRpcEndpoint,
  } = useLocalStorage(LocalStorageKey.CUSTOM_RPC_ENDPOINT);

  const {
    set: setCachedNetworkName,
    get: getCachedNetworkName,
    remove: removeCachedNetworkName,
  } = useLocalStorage(LocalStorageKey.WEBB_NETWORK_NAME);

  // Load the initial network from local storage.
  useEffect(() => {
    const getCachedInitialNetwork = () => {
      const cachedNetworkName = getCachedNetworkName();

      if (cachedNetworkName !== null) {
        const network = ALL_WEBB_NETWORKS.find(
          (network) => network.name === cachedNetworkName
        );

        if (network !== undefined) {
          return network;
        }

        console.warn(
          `Could not find an associated network for cached network name: ${cachedNetworkName}, deleting from local storage`
        );

        removeCachedNetworkName();

        return DEFAULT_NETWORK;
      }

      const cachedCustomRpcEndpoint = getCachedCustomRpcEndpoint();

      if (cachedCustomRpcEndpoint !== null) {
        setIsCustom(true);

        return createCustomNetwork(cachedCustomRpcEndpoint);
      }

      return DEFAULT_NETWORK;
    };

    const initialNetwork = getCachedInitialNetwork();

    setNetwork(initialNetwork);
  }, [
    getCachedCustomRpcEndpoint,
    getCachedNetworkName,
    removeCachedNetworkName,
    setNetwork,
  ]);

  // Set global RPC endpoint when the network changes,
  // and also changes to local storage for future use.
  const setNetworkOverride = useCallback(
    async (newNetwork: Network, isCustom: boolean) => {
      if (!(await testRpcEndpointConnection(newNetwork.polkadotEndpoint))) {
        notificationApi({
          variant: 'error',
          message: `Unable to connect to the requested network: ${newNetwork.polkadotEndpoint}`,
        });

        return;
      }

      console.debug(
        `Switching to ${isCustom ? 'custom' : 'Webb'} network: ${
          newNetwork.name
        } (${newNetwork.networkType}, ${
          newNetwork.networkNodeType
        }) with RPC endpoint: ${newNetwork.polkadotEndpoint}`
      );

      if (isCustom) {
        removeCachedNetworkName();
        setCachedCustomRpcEndpoint(newNetwork.polkadotEndpoint);
      } else {
        removeCachedCustomRpcEndpoint();
        setCachedNetworkName(newNetwork.name);
      }

      setIsCustom(isCustom);
      setNetwork(newNetwork);
    },
    [
      removeCachedCustomRpcEndpoint,
      removeCachedNetworkName,
      setCachedCustomRpcEndpoint,
      setCachedNetworkName,
      setNetwork,
    ]
  );

  return {
    network,
    setNetwork: setNetworkOverride,
    isCustom,
  };
};

export default useNetworkState;

function testRpcEndpointConnection(rpcEndpoint: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(rpcEndpoint);

      const handleOpen = () => {
        ws.removeEventListener('open', handleOpen);
        ws.close();
        resolve(true);
      };

      const handleCloseEvent = () => {
        ws.removeEventListener('close', handleCloseEvent);
        resolve(false);
      };

      ws.addEventListener('open', handleOpen);
      ws.addEventListener('close', handleCloseEvent);
    } catch {
      resolve(false);
    }
  });
}
