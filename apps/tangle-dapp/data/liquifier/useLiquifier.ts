import { useMemo } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const useLiquifier = () => {
  // TODO: Generate ABI using Remix, based on Solidity contracts. Then, attach the ABI to the client.
  const client = useMemo(() => {
    return createPublicClient({
      chain: mainnet,
      transport: http(),
    });
  }, []);

  // TODO: Implement.
};

export default useLiquifier;
