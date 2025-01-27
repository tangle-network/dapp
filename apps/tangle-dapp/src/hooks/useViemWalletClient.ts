import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { useEffect, useState } from 'react';
import { createWalletClient, http, WalletClient } from 'viem';

import createTangleViemChainFromNetwork from '../utils/evm/createTangleViemChainFromNetwork';

const useViemWalletClient = () => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const { network } = useNetworkStore();

  // Update the wallet client when the network changes.
  useEffect(() => {
    if (
      network.evmChainId === undefined ||
      network.httpRpcEndpoint === undefined
    ) {
      return;
    }

    const chain = createTangleViemChainFromNetwork({
      ...network,
      evmChainId: network.evmChainId,
      httpRpcEndpoint: network.httpRpcEndpoint,
    });

    const newWalletClient = createWalletClient({
      chain,
      // TODO: Try with custom(window.ethereum).
      transport: http(),
    });

    setWalletClient(newWalletClient);
  }, [network]);

  return walletClient;
};

export default useViemWalletClient;
