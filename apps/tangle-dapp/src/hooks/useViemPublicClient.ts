import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { useEffect, useState } from 'react';
import { createPublicClient, http, type PublicClient } from 'viem';

import createTangleViemChainFromNetwork from '../utils/evm/createTangleViemChainFromNetwork';

const useViemPublicClient = () => {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const { network } = useNetworkStore();

  // Update the public client when the network changes.
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

    const newPublicClient = createPublicClient({
      chain,
      transport: http(),
    });

    setPublicClient(newPublicClient);
  }, [network]);

  return publicClient;
};

export default useViemPublicClient;
