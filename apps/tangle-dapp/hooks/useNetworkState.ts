import { notificationApi } from '@webb-tools/webb-ui-components';
import {
  Network,
  NETWORK_MAP,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useEffect, useState } from 'react';
import z from 'zod';

import { DEFAULT_NETWORK } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import createCustomNetwork from '../utils/createCustomNetwork';
import { getNativeTokenSymbol } from '../utils/polkadot';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
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

async function switchNetworkInEvmWallet(network: Network): Promise<void> {
  // TODO: This is failing with: "Expected 0x-prefixed, unpadded, non-zero hexadecimal string 'chainId'. Received: "3799". Perhaps the chainId should be in hex format?

  // Cannot switch networks on EVM wallets if the network
  // doesn't have a defined chain id or if there is no
  // EVM wallet extension present.
  if (
    window.ethereum === undefined ||
    network.chainId === undefined ||
    network.httpRpcEndpoint === undefined
  ) {
    return;
  }

  // Request to switch to the network (if it's already configured in the wallet).
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId.toString() }],
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code !== 4902
    ) {
      console.error('Error switching network:', error);

      return;
    }

    // The network is not added to the wallet, request to add it.
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: network.chainId.toString(),
            rpcUrls: [network.httpRpcEndpoint],
            chainName: network.name,
            // TODO: Any other network params?
          },
        ],
      });
    } catch (addError) {
      console.error('Error adding network:', addError);
    }
  }
}

const useNetworkState = () => {
  const { isEvm } = useAgnosticAccountInfo();
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
          const knownNetwork = NETWORK_MAP[parsedNetworkId.data];

          if (knownNetwork !== undefined) {
            return knownNetwork;
          }
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
  const switchNetwork = useCallback(
    async (newNetwork: Network, isCustom: boolean) => {
      // Already on the requested network.
      if (network.id === newNetwork.id) {
        return;
      } else if (!(await testRpcEndpointConnection(newNetwork.wsRpcEndpoint))) {
        notificationApi({
          variant: 'error',
          message: `Unable to connect to the requested network: ${newNetwork.wsRpcEndpoint}`,
        });

        return;
      }

      console.debug(
        `Switching to ${isCustom ? 'custom' : 'Webb'} network: ${
          newNetwork.name
        } (${newNetwork.nodeType}) with RPC endpoint: ${
          newNetwork.wsRpcEndpoint
        }`
      );

      if (isCustom) {
        removeCachedNetworkId();
        setCachedCustomRpcEndpoint(newNetwork.wsRpcEndpoint);
      } else {
        removeCachedCustomRpcEndpoint();
        setCachedNetworkId(newNetwork.id);
      }

      await fetchTokenSymbol(newNetwork.wsRpcEndpoint);

      setIsCustom(isCustom);
      setNetwork(newNetwork);

      if (isEvm !== null && isEvm) {
        switchNetworkInEvmWallet(newNetwork);
      }
    },
    [
      network.id,
      fetchTokenSymbol,
      setNetwork,
      isEvm,
      removeCachedNetworkId,
      setCachedCustomRpcEndpoint,
      removeCachedCustomRpcEndpoint,
      setCachedNetworkId,
    ]
  );

  return {
    network,
    setNetwork: switchNetwork,
    isCustom,
  };
};

export default useNetworkState;
