import { notificationApi } from '@webb-tools/webb-ui-components';
import {
  Network,
  NETWORK_MAP,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants';
import { useCallback, useEffect, useState } from 'react';
import z from 'zod';

import { DEFAULT_NETWORK } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import createCustomNetwork from '../utils/createCustomNetwork';
import { getNativeTokenSymbol } from '../utils/polkadot';
import useLocalStorage, { LocalStorageKey } from './useLocalStorage';

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

async function switchNetworkInWeb3(network: Network): Promise<void> {
  if (window.ethereum === undefined) {
    return;
  }

  try {
    // Request to switch to the network (if it's already configured in the wallet)
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network }],
    });
  } catch (error) {
    if (error.code === 4902) {
      try {
        // The network is not added to the wallet, request to add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              rpcUrls: [rpcUrl],
              chainName,
              // Add other network parameters if needed
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding network:', addError);
      }
    } else {
      console.error('Error switching network:', error);
    }
  }
}

const useNetworkState = () => {
  const [isCustom, setIsCustom] = useState(false);

  const { network, setNetwork, rpcEndpoint, setNativeTokenSymbol } =
    useNetworkStore();

  const { get: getCachedNativeTokenSymbol, set: setCachedNativeTokenSymbol } =
    useLocalStorage(LocalStorageKey.NATIVE_TOKEN_SYMBOL);

  const {
    get: getCachedCustomRpcEndpoint,
    set: setCachedCustomRpcEndpoint,
    remove: removeCachedCustomRpcEndpoint,
  } = useLocalStorage(LocalStorageKey.CUSTOM_RPC_ENDPOINT);

  const {
    set: setCachedNetworkId,
    get: getCachedNetworkId,
    remove: removeCachedNetworkId,
  } = useLocalStorage(LocalStorageKey.KNOWN_NETWORK_ID);

  const fetchTokenSymbol = useCallback(
    async (rpcEndpoint: string) => {
      try {
        const tokenSymbol = await getNativeTokenSymbol(rpcEndpoint);

        setNativeTokenSymbol(tokenSymbol);
        setCachedNativeTokenSymbol(tokenSymbol);
      } catch {
        notificationApi({
          variant: 'error',
          message: `Unable to fetch token symbol for ${network.name}.`,
        });
      }
    },
    [network.name, setCachedNativeTokenSymbol, setNativeTokenSymbol]
  );

  // Load the initial network from local storage.
  useEffect(() => {
    const getCachedInitialNetwork = () => {
      const cachedNetworkName = getCachedNetworkId();

      // If the cached network name is present, that indicates that
      // the cached network is a Webb network. Find it in the list of
      // all Webb networks, and return it.
      if (cachedNetworkName !== null) {
        const parsedNetworkId = z
          .nativeEnum(NetworkId)
          .safeParse(cachedNetworkName);

        if (parsedNetworkId.success) {
          return NETWORK_MAP[parsedNetworkId.data];
        }

        console.warn(
          `Could not find an associated network for cached network id: ${cachedNetworkName}, deleting from local storage`
        );

        removeCachedNetworkId();

        return DEFAULT_NETWORK;
      }

      const cachedCustomRpcEndpoint = getCachedCustomRpcEndpoint();

      // If a custom RPC endpoint is cached, return it as a custom network.
      if (cachedCustomRpcEndpoint !== null) {
        setIsCustom(true);

        return createCustomNetwork(cachedCustomRpcEndpoint);
      }

      // Otherwise, use the default network.
      return DEFAULT_NETWORK;
    };

    // TODO: Test connection to the initial cached network, if it fails, use the default network instead. If the initial cached network IS the default network already and the connection is failing... it's a bit more complicated.
    setNetwork(getCachedInitialNetwork());
  }, [
    getCachedCustomRpcEndpoint,
    getCachedNetworkId,
    removeCachedNetworkId,
    setNetwork,
  ]);

  // Load initial token symbol from local storage.
  useEffect(() => {
    const cachedTokenSymbol = getCachedNativeTokenSymbol();

    if (cachedTokenSymbol !== null) {
      setNativeTokenSymbol(cachedTokenSymbol);

      return;
    }

    fetchTokenSymbol(rpcEndpoint);
  }, [
    getCachedNativeTokenSymbol,
    rpcEndpoint,
    fetchTokenSymbol,
    setNativeTokenSymbol,
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
        } (${newNetwork.nodeType}) with RPC endpoint: ${
          newNetwork.polkadotEndpoint
        }`
      );

      if (isCustom) {
        removeCachedNetworkId();
        setCachedCustomRpcEndpoint(newNetwork.polkadotEndpoint);
      } else {
        removeCachedCustomRpcEndpoint();
        setCachedNetworkId(newNetwork.id);
      }

      await fetchTokenSymbol(newNetwork.polkadotEndpoint);

      setIsCustom(isCustom);
      setNetwork(newNetwork);
    },
    [
      removeCachedCustomRpcEndpoint,
      removeCachedNetworkId,
      setCachedCustomRpcEndpoint,
      setCachedNetworkId,
      setNetwork,
      fetchTokenSymbol,
    ]
  );

  return {
    network,
    setNetwork: setNetworkOverride,
    isCustom,
  };
};

export default useNetworkState;
