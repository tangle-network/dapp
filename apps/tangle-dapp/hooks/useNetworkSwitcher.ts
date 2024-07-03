import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  type Chain,
  chainsPopulated,
  DEFAULT_DECIMALS,
  type WalletConfig,
} from '@webb-tools/dapp-config';
import { DEFAULT_SS58 } from '@webb-tools/dapp-config/constants/polkadot';
import getWalletsForTypedChainId from '@webb-tools/dapp-config/utils/getWalletIdsForTypedChainId';
import { calculateTypedChainId, ChainType } from '@webb-tools/utils';
import { notificationApi } from '@webb-tools/webb-ui-components';
import {
  Network,
  NETWORK_MAP,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useEffect, useState } from 'react';
import { createPublicClient, fallback, http, webSocket } from 'viem';
import z from 'zod';

import { DEFAULT_NETWORK } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import createCustomNetwork from '../utils/createCustomNetwork';
import ensureError from '../utils/ensureError';
import { getApiPromise } from '../utils/polkadot';
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

const useNetworkSwitcher = () => {
  const { switchChain, activeWallet } = useWebContext();

  const [isCustom, setIsCustom] = useState(false);

  const { network, setNetwork } = useNetworkStore();

  // TODO: Should utilize the zustand middleware to cache this
  // in instead of manually handling it here.
  // if we set the network by calling `setNetwork`,
  // the new network won't be cached in local storage.
  // @see https://docs.pmnd.rs/zustand/integrations/persisting-store-data
  const {
    refresh: getCachedCustomRpcEndpoint,
    set: setCachedCustomRpcEndpoint,
    remove: removeCachedCustomRpcEndpoint,
  } = useLocalStorage(LocalStorageKey.CUSTOM_RPC_ENDPOINT);

  // TODO: Should utilize the zustand middleware to cache this
  // in instead of manually handling it here.
  // if we set the network by calling `setNetwork`,
  // the new network won't be cached in local storage.
  // @see https://docs.pmnd.rs/zustand/integrations/persisting-store-data
  const {
    set: setCachedNetworkId,
    refresh: getCachedNetworkId,
    remove: removeCachedNetworkId,
  } = useLocalStorage(LocalStorageKey.KNOWN_NETWORK_ID);

  // Load the initial network from local storage.
  useEffect(() => {
    const getCachedInitialNetwork = () => {
      const cachedNetworkNameOpt = getCachedNetworkId();

      // If the cached network name is present, that indicates that
      // the cached network is a Webb network. Find it in the list of
      // all Webb networks, and return it.
      if (cachedNetworkNameOpt.value !== null) {
        const parsedNetworkId = z
          .nativeEnum(NetworkId)
          .safeParse(cachedNetworkNameOpt.value);

        if (parsedNetworkId.success) {
          const id = parsedNetworkId.data as keyof typeof NETWORK_MAP;
          const knownNetwork = NETWORK_MAP[id];

          if (knownNetwork !== undefined) {
            return knownNetwork;
          }
        }

        console.warn(
          `Could not find an associated network for cached network id: ${cachedNetworkNameOpt.value}, deleting from local storage`,
        );

        removeCachedNetworkId();

        return DEFAULT_NETWORK;
      }

      const cachedCustomRpcEndpointOpt = getCachedCustomRpcEndpoint();

      // If a custom RPC endpoint is cached, return it as a custom network.
      if (cachedCustomRpcEndpointOpt.value !== null) {
        setIsCustom(true);

        return createCustomNetwork(cachedCustomRpcEndpointOpt.value);
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

      if (activeWallet !== undefined) {
        try {
          const chain = await netWorkToChain(newNetwork, activeWallet);

          const switchChainResult = await switchChain(chain, activeWallet);

          if (switchChainResult !== null) {
            console.debug(
              `Switching to ${isCustom ? 'custom' : 'Webb'} network: ${
                newNetwork.name
              } (${newNetwork.nodeType}) with RPC endpoint: ${
                newNetwork.wsRpcEndpoint
              }`,
            );
          }
        } catch (error) {
          notificationApi({
            variant: 'error',
            message: 'Switching network failed',
            secondaryMessage: `Error: ${ensureError(error).message}`,
          });
        }
      }

      // Update local storage cache with the new network.
      if (isCustom) {
        removeCachedNetworkId();
        setCachedCustomRpcEndpoint(newNetwork.wsRpcEndpoint);
      } else {
        removeCachedCustomRpcEndpoint();
        setCachedNetworkId(newNetwork.id);
      }

      setIsCustom(isCustom);
      setNetwork(newNetwork);
    },
    // prettier-ignore
    [activeWallet, network.id, removeCachedCustomRpcEndpoint, removeCachedNetworkId, setCachedCustomRpcEndpoint, setCachedNetworkId, setNetwork, switchChain],
  );

  return {
    switchNetwork,
    isCustom,
  };
};

/**
 * Map a network to a chain
 * @param network the network to map to a chain
 * @param chainsConfig the chains configuration
 * @param activeWallet the active wallet
 *
 * @returns the chain
 */
async function netWorkToChain(network: Network, activeWallet: WalletConfig) {
  if (activeWallet.platform === 'Substrate') {
    const api = await getApiPromise(network.wsRpcEndpoint);

    // if the chain id is not defined, fetch the chain id from the api
    if (network.chainId === undefined) {
      network.chainId =
        typeof api.registry.chainSS58 === 'number'
          ? api.registry.chainSS58
          : DEFAULT_SS58.toNumber();
    }

    const deciamls =
      api.registry.chainDecimals.length > 0
        ? api.registry.chainDecimals[0]
        : DEFAULT_DECIMALS;

    const typedChainId = calculateTypedChainId(
      ChainType.Substrate,
      network.chainId,
    );

    const chain =
      chainsPopulated[typedChainId] !== undefined
        ? chainsPopulated[typedChainId]
        : defineWebbChain(
            network,
            network.chainId,
            ChainType.Substrate,
            typedChainId,
            deciamls,
          );

    return chain;
  }

  const viemClient = createPublicClient({
    transport: fallback(
      network.httpRpcEndpoint
        ? [http(network.httpRpcEndpoint, { timeout: 60_000 })]
        : [webSocket(network.wsRpcEndpoint, { timeout: 60_000 })],
    ),
  });

  network.evmChainId = await viemClient.getChainId();

  const typedChainId = calculateTypedChainId(ChainType.EVM, network.evmChainId);

  const chain = chainsPopulated[typedChainId]
    ? chainsPopulated[typedChainId]
    : defineWebbChain(
        network,
        network.evmChainId,
        ChainType.EVM,
        typedChainId,
        DEFAULT_DECIMALS,
      );

  return chain;
}

function defineWebbChain(
  network: Network,
  chainId: number,
  chainType: ChainType,
  typedChainId: number,
  decimals: number,
): Chain {
  return {
    id: chainId,
    name: network.name,
    nativeCurrency: {
      name: network.tokenSymbol,
      symbol: network.tokenSymbol,
      decimals,
    },
    rpcUrls: {
      default: {
        http: [
          network.httpRpcEndpoint
            ? network.httpRpcEndpoint
            : network.wsRpcEndpoint,
        ],
        webSocket: [network.wsRpcEndpoint],
      },
    },
    chainType,
    group: 'tangle',
    tag: 'test',
    wallets: getWalletsForTypedChainId(typedChainId),
  } satisfies Chain;
}

export default useNetworkSwitcher;
