import { useMemo } from 'react';
import { createPublicClient, http } from 'viem';

import useEvmChain from './useEvmChain';

const useViemPublicClient = () => {
  const evmChain = useEvmChain();

  return useMemo(() => {
    if (evmChain === null) {
      return null;
    }

    return createPublicClient({
      chain: evmChain,
      transport: http(),
    });
  }, [evmChain]);
};

export default useViemPublicClient;
