import { useEffect, useState } from 'react';
import { createPublicClient, http, type PublicClient } from 'viem';

import useEvmChain from './useEvmChain';

const useViemPublicClient = () => {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const evmChain = useEvmChain();

  // Update the public client when the network changes.
  useEffect(() => {
    if (evmChain === null) {
      return;
    }

    const newPublicClient = createPublicClient({
      chain: evmChain,
      transport: http(),
    });

    setPublicClient(newPublicClient);
  }, [evmChain]);

  return publicClient;
};

export default useViemPublicClient;
