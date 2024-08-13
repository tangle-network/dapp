import { useEffect, useState } from 'react';
import { createPublicClient, http, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';

const useEthereumMainnetClient = () => {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  useEffect(() => {
    const newPublicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    setPublicClient(newPublicClient);
  }, []);

  return publicClient;
};

export default useEthereumMainnetClient;
