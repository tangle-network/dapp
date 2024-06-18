import { defaults as addressDefaults } from '@polkadot/util-crypto/address/defaults';
import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import {
  type Chain,
  chainsPopulated,
  DEFAULT_DECIMALS,
  type WalletConfig,
} from '@webb-tools/dapp-config';
import getWalletsForTypedChainId from '@webb-tools/dapp-config/utils/getWalletIdsForTypedChainId';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
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

const useNetworkState = () => {
  const { switchChain, activeWallet } = useWebContext();
  const { toggleModal } = useConnectWallet({ useAllWallets: true });

  const [isCustom, setIsCustom] = useState(false);

  const { network, setNetwork } = useNetworkStore();

  const {
    refresh: getCachedCustomRpcEndpoint,
    set: setCachedCustomRpcEndpoint,
    remove: removeCachedCustomRpcEndpoint,
  } = useLocalStorage(LocalStorageKey.CUSTOM_RPC_ENDPOINT);

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
          const knownNetwork = NETWORK_MAP[parsedNetworkId.data];

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

      // If no active wallet, show the wallet modal and return.
      if (activeWallet === undefined) {
        toggleModal(true);
        return;
      }

      try {
        const chain = overrideRpcForLocalnet(
          newNetwork,
          await netWorkToChain(newNetwork, activeWallet),
        );

        const switchChainResult = await switchChain(chain, activeWallet);

        if (switchChainResult !== null) {
          console.debug(
            `Switching to ${isCustom ? 'custom' : 'Webb'} network: ${
              newNetwork.name
            } (${newNetwork.nodeType}) with RPC endpoint: ${
              newNetwork.wsRpcEndpoint
            }`,
          );

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
        }
      } catch (error) {
        notificationApi({
          variant: 'error',
          message: 'Switching network failed',
          secondaryMessage: `Error: ${ensureError(error).message}`,
        });
      }
    },
    // prettier-ignore
    [activeWallet, network, removeCachedCustomRpcEndpoint, removeCachedNetworkId, setCachedCustomRpcEndpoint, setCachedNetworkId, setNetwork, switchChain, toggleModal],
  );

  return {
    network,
    setNetwork: switchNetwork,
    isCustom,
  };
};

export default useNetworkState;

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
          : api.registry.createType('u32', addressDefaults.prefix).toNumber();
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

const OVERRIDDEN_TYPED_CHAIN_IDS = [
  PresetTypedChainId.TangleTestnetEVM,
  PresetTypedChainId.TangleTestnetNative,
];

/**
 * @internal
 * If the network is local network, we need to override the rpc
 * as the local network and test network have the same chain id
 *
 * @param network the network to check
 * @param chain the chain to override the rpc
 * @returns the orrverriden rpc chain
 */
function overrideRpcForLocalnet(network: Network, chain: Chain): Chain {
  const needOverrideRpc =
    network.id === NetworkId.TANGLE_LOCAL_DEV &&
    OVERRIDDEN_TYPED_CHAIN_IDS.includes(
      calculateTypedChainId(chain.chainType, chain.id),
    );

  if (!needOverrideRpc) {
    return { ...chain };
  }

  // Override the rpc for the local network
  // and remove the block explorer
  const { blockExplorers: _, ...restChain } = chain;

  return {
    ...restChain,
    rpcUrls: {
      default: {
        http: network.httpRpcEndpoint ? [network.httpRpcEndpoint] : [],
        webSocket: [network.wsRpcEndpoint],
      },
    },
  };
}
