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
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useEffect, useState } from 'react';
import { createPublicClient, fallback, http, webSocket } from 'viem';

import testRpcEndpointConnection from '../components/NetworkSelector/testRpcEndpointConnection';
import useNetworkStore from '../context/useNetworkStore';
import ensureError from '../utils/ensureError';
import { getApiPromise } from '../utils/polkadot';
import useInitialNetwork from './useInitialNetwork';
import useLocalStorage, { LocalStorageKey } from './useLocalStorage';

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

  const getCachedInitialNetwork = useInitialNetwork();

  // Load the initial network from local storage.
  useEffect(() => {
    getCachedInitialNetwork().then((initialNetwork) => {
      if (initialNetwork.id === NetworkId.CUSTOM) {
        setIsCustom(true);
      }

      setNetwork(initialNetwork);
    });
  }, [
    getCachedCustomRpcEndpoint,
    getCachedInitialNetwork,
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
        return true;
      }
      // Test connection to the new network.
      else if (!(await testRpcEndpointConnection(newNetwork.wsRpcEndpoint))) {
        notificationApi({
          variant: 'error',
          message: `Unable to connect to the requested network: ${newNetwork.wsRpcEndpoint}`,
        });

        return false;
      }

      if (activeWallet !== undefined) {
        try {
          const chain = await mapNetworkToChain(newNetwork, activeWallet);

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

      return true;
    },
    [
      activeWallet,
      network.id,
      removeCachedCustomRpcEndpoint,
      removeCachedNetworkId,
      setCachedCustomRpcEndpoint,
      setCachedNetworkId,
      setNetwork,
      switchChain,
    ],
  );

  return {
    switchNetwork,
    isCustom,
  };
};

async function mapNetworkToChain(
  network: Network,
  activeWallet: WalletConfig,
): Promise<Chain> {
  if (activeWallet.platform === 'Substrate') {
    const api = await getApiPromise(network.wsRpcEndpoint);

    // if the chain id is not defined, fetch the chain id from the api
    if (network.substrateChainId === undefined) {
      network.substrateChainId =
        typeof api.registry.chainSS58 === 'number'
          ? api.registry.chainSS58
          : DEFAULT_SS58.toNumber();
    }

    const decimals =
      api.registry.chainDecimals.length > 0
        ? api.registry.chainDecimals[0]
        : DEFAULT_DECIMALS;

    const typedChainId = calculateTypedChainId(
      ChainType.Substrate,
      network.substrateChainId,
    );

    const chain =
      chainsPopulated[typedChainId] !== undefined
        ? chainsPopulated[typedChainId]
        : defineWebbChain(
            network,
            network.substrateChainId,
            ChainType.Substrate,
            typedChainId,
            decimals,
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
