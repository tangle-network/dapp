import { useEffect, useState } from 'react';
import { Chain, createPublicClient, http, PublicClient } from 'viem';

const useViemPublicClientWithChain = (chain: Chain) => {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  useEffect(() => {
    const newPublicClient = createPublicClient({
      chain,
      transport: http(),
    });

    setPublicClient(newPublicClient);
  }, [chain]);

  return publicClient;
};

export default useViemPublicClientWithChain;
