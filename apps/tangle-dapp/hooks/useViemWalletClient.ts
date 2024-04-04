import {
  Network,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { useEffect, useState } from 'react';
import { Chain, createWalletClient, custom, PublicClient } from 'viem';

import useNetworkStore from '../context/useNetworkStore';
import useEvmAddress from './useEvmAddress';

const createTangleViemChainFromNetwork = (
  network: Network & { chainId: number }
): Chain => {
  const currencyName =
    network.id === NetworkId.TANGLE_MAINNET
      ? 'Tangle Network Token'
      : 'Test Tangle Network Token';

  const currencySymbol =
    network.id === NetworkId.TANGLE_MAINNET ? 'TNT' : 'tTNT';

  const blockExplorerName =
    network.id === NetworkId.TANGLE_MAINNET
      ? 'Tangle EVM Explorer'
      : 'Tangle Testnet EVM Explorer';

  return {
    id: network.chainId,
    name: network.name,
    nativeCurrency: {
      name: currencyName,
      symbol: currencySymbol,
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: blockExplorerName,
        // TODO: Need to ensure that this will work as expected and not cause issues? Is it fine to default to the Polkadot explorer for a Viem chain?
        // Default to the Polkadot explorer if the EVM explorer URL is not set.
        url: network.evmExplorerUrl ?? network.polkadotExplorerUrl,
      },
    },
    rpcUrls: {
      default: {
        http: [network.rpcEndpoint],
      },
      public: {
        http: [network.rpcEndpoint],
      },
    },
  };
};

const useViemWalletClient = () => {
  const [client, setClient] = useState<PublicClient | null>(null);
  const { network } = useNetworkStore();
  const activeEvmAddress = useEvmAddress();

  useEffect(() => {
    if (
      window.ethereum === undefined ||
      network.chainId === undefined ||
      activeEvmAddress === null
    ) {
      return;
    }

    const newClient = createWalletClient({
      chain: createTangleViemChainFromNetwork({
        ...network,
        chainId: network.chainId,
      }),
      account: activeEvmAddress,
      transport: custom(window.ethereum),
    });

    setClient(newClient);
  }, [activeEvmAddress, network]);

  return client;
};

export default useViemWalletClient;
