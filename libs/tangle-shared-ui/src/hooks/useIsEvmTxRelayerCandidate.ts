import useNetworkStore from '../context/useNetworkStore';
import useBalances from './useBalances';

const useIsEvmTxRelayerCandidate = (): boolean | null => {
  const { free } = useBalances();
  const network = useNetworkStore((store) => store.network2);

  if (free === null || network === undefined) {
    return null;
  }

  return free.isZero() && network.evmTxRelayerEndpoint !== undefined;
};

export default useIsEvmTxRelayerCandidate;
