import { useMemo } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const useLiquifierBalances = () => {
  const client = useMemo(() => {
    return createPublicClient({
      chain: mainnet,
      transport: http(),
    });
  }, []);
};

export default useLiquifierBalances;
