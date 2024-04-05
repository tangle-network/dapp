import { useEffect, useState } from 'react';
import { createPublicClient, http, PublicClient } from 'viem';

import useNetworkStore from '../context/useNetworkStore';
import createTangleViemChainFromNetwork from '../utils/evm/createTangleViemChainFromNetwork';

const useViemPublicClient = () => {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const { network } = useNetworkStore();

  // Update the public client when the network changes.
  useEffect(() => {
    if (
      network.chainId === undefined ||
      network.httpRpcEndpoint === undefined
    ) {
      return;
    }

    const chain = createTangleViemChainFromNetwork({
      ...network,
      chainId: network.chainId,
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
