import { useMemo } from 'react';
import useNetworkStore from '../context/useNetworkStore';
import getTangleEvmChain from '../utils/getTangleEvmChain';

const useEvmChain = () => {
  const { network2 } = useNetworkStore();

  const chain = useMemo(() => {
    if (
      network2 === undefined ||
      network2.evmChainId === undefined ||
      network2.httpRpcEndpoint === undefined
    ) {
      return null;
    }

    const chain = getTangleEvmChain({
      ...network2,
      evmChainId: network2.evmChainId,
    });

    return chain;
  }, [network2]);

  return chain;
};

export default useEvmChain;
