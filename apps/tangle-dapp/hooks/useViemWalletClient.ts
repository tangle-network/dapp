import { useEffect, useState } from 'react';
import { createWalletClient, custom, type WalletClient } from 'viem';

import useNetworkStore from '../context/useNetworkStore';
import createTangleViemChainFromNetwork from '../utils/evm/createTangleViemChainFromNetwork';
import useEvmAddress from './useEvmAddress';

const useViemWalletClient = () => {
  const [client, setClient] = useState<WalletClient | null>(null);
  const { network } = useNetworkStore();
  const activeEvmAddress = useEvmAddress();

  // Update the wallet client when the network changes.
  useEffect(() => {
    if (
      window.ethereum === undefined ||
      network.evmChainId === undefined ||
      network.httpRpcEndpoint === undefined ||
      activeEvmAddress === null
    ) {
      return;
    }

    const chain = createTangleViemChainFromNetwork({
      ...network,
      chainId: network.evmChainId,
      httpRpcEndpoint: network.httpRpcEndpoint,
    });

    const newWalletClient = createWalletClient({
      chain,
      account: activeEvmAddress,
      transport: custom(window.ethereum),
    });

    setClient(newWalletClient);
  }, [activeEvmAddress, network]);

  return client;
};

export default useViemWalletClient;
