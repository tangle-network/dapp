import { useMemo } from 'react';
import { Chain, createPublicClient, http } from 'viem';

const useViemPublicClientWithChain = (chain: Chain) => {
  return useMemo(
    () =>
      createPublicClient({
        chain,
        transport: http(),
      }),
    [chain],
  );
};

export default useViemPublicClientWithChain;
