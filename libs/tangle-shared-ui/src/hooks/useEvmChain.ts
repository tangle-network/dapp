import { useMemo } from 'react';
import useNetworkStore from '../context/useNetworkStore';
import createTangleViemChainFromNetwork from '../utils/createTangleViemChainFromNetwork';

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

    const chain = createTangleViemChainFromNetwork({
      ...network2,
      evmChainId: network2.evmChainId,
      httpRpcEndpoint: network2.httpRpcEndpoint,
    });

    return chain;
  }, [network2]);

  return chain;
};

export default useEvmChain;
