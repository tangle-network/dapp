import {
  InjectedExtension,
  MetadataDef,
} from '@polkadot/extension-inject/types';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain } from '@webb-tools/dapp-config';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { calculateTypedChainId, ChainType } from '@webb-tools/utils';
import { notificationApi } from '@webb-tools/webb-ui-components';
import {
  Network,
  NETWORK_MAP,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import z from 'zod';

import { DEFAULT_NETWORK } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import { TokenSymbol } from '../types';
import createCustomNetwork from '../utils/createCustomNetwork';
import { findInjectorForAddress, getApiPromise } from '../utils/polkadot';
import useActiveAccountAddress from './useActiveAccountAddress';
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

const updateSubstrateWalletsMetadata = async (
  injector: InjectedExtension,
  rpcEndpoint: string,
  tokenSymbol: TokenSymbol,
  ss58Prefix: number
) => {
  const api = await getApiPromise(rpcEndpoint);
  const existingMetadata = await injector.metadata?.get();

  const metadata: MetadataDef = {
    tokenDecimals: TANGLE_TOKEN_DECIMALS,
    tokenSymbol,
    genesisHash: api.genesisHash.toHex(),
    specVersion: api.runtimeVersion.specVersion.toNumber(),
    icon: 'substrate',
    ss58Format: ss58Prefix,
    types: {},
    chain: api.runtimeChain.toString(),
  };

  // The 'provide' request will throw an error if the user
  // rejects the request. Leniently catch the error and log it.
  const handleError = (error: unknown) => {
    console.error(`Failed to provide metadata to injected extension: ${error}`);
  };

  // No metadata exists yet; provide it.
  if (existingMetadata === undefined) {
    await injector.metadata?.provide(metadata).catch(handleError);
  }
  // Metadata exists; check if it's up to date.
  else {
    for (const existing of existingMetadata) {
      // Already up to date; ignore.
      if (_.isEqual(existing, metadata)) {
        return;
      }

      await injector.metadata?.provide(metadata).catch(handleError);

      break;
    }
  }
};

const useNetworkState = () => {
  const { switchChain, activeWallet, chains } = useWebContext();

  const activeAccountAddress = useActiveAccountAddress();
  const { isEvm } = useAgnosticAccountInfo();
  const [isCustom, setIsCustom] = useState(false);

  const { network, setNetwork } = useNetworkStore();

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

      // In case that the new network is an EVM network, either add it
      // to the list of chains on the EVM wallet (ie. MetaMask), or switch
      // to it if it's already added.
      if (
        isEvm !== null &&
        isEvm &&
        newNetwork.evmChainId !== undefined &&
        newNetwork.httpRpcEndpoint !== undefined &&
        activeWallet !== undefined
      ) {
        // TODO: For local dev, the chain id is set to the testnet's chain id. Which then attempts to switch to the testnet chain, and its RPC url. Changing the way that the provider API works requires extensive changes, so leaving this for later since local dev is not a priority.
        const typedChainId = calculateTypedChainId(
          ChainType.EVM,
          newNetwork.evmChainId
        );

        const webbChain: Chain | undefined = chains[typedChainId];

        if (webbChain !== undefined) {
          // This call will automatically switch the chain if it's already added.
          switchChain(webbChain, activeWallet);
        }
      }

      // TODO: Better placement for this, or at least call it once on app start. Also consider having it be a button instead to prevent spamming the user on first visit.
      // Update Substrate wallet extensions' metadata if appropriate.
      if (activeAccountAddress !== null && network.ss58Prefix !== undefined) {
        const injector = await findInjectorForAddress(activeAccountAddress);

        if (injector !== null) {
          updateSubstrateWalletsMetadata(
            injector,
            network.wsRpcEndpoint,
            network.tokenSymbol,
            network.ss58Prefix
          );
        }
      }
    },
    [
      network.id,
      network.ss58Prefix,
      network.wsRpcEndpoint,
      network.tokenSymbol,
      setNetwork,
      isEvm,
      activeWallet,
      activeAccountAddress,
      removeCachedNetworkId,
      setCachedCustomRpcEndpoint,
      removeCachedCustomRpcEndpoint,
      setCachedNetworkId,
      chains,
      switchChain,
    ]
  );

  return {
    network,
    setNetwork: switchNetwork,
    isCustom,
  };
};

export default useNetworkState;
