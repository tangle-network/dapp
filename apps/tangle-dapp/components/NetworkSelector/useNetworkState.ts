import { Network } from '@webb-tools/webb-ui-components/constants';
import { useCallback, useEffect, useState } from 'react';

import { ALL_WEBB_NETWORKS, DEFAULT_NETWORK } from '../../constants/networks';
import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import createCustomNetwork from './createCustomNetwork';

const useNetworkState = () => {
  const { setRpcEndpoint } = useRpcEndpointStore();
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

  const [network, setNetwork] = useState<Network | null>(null);

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

    setNetwork(getCachedInitialNetwork());
  }, [
    getCachedCustomRpcEndpoint,
    getCachedNetworkName,
    removeCachedNetworkName,
  ]);

  // Set global RPC endpoint when the network changes,
  // and also changes to local storage for future use.
  const setNetworkOverride = useCallback(
    (newNetwork: Network, isCustom: boolean) => {
      console.debug(
        `Switching to ${isCustom ? 'custom' : 'Webb'} network: ${
          newNetwork.name
        } (${newNetwork.networkType}, ${
          newNetwork.networkNodeType
        }) with RPC endpoint: ${newNetwork.polkadotEndpoint}`
      );

      // This should trigger a re-render of all places that use the
      // RPC endpoint, leading them to re-connect to the new endpoint.
      setRpcEndpoint(newNetwork.polkadotEndpoint);

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
      setRpcEndpoint,
    ]
  );

  return {
    network,
    setNetwork: setNetworkOverride,
    isCustom,
  };
};

export default useNetworkState;
