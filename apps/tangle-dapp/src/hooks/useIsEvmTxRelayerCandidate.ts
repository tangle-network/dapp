import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useBalances from '../data/balances/useBalances';

const useIsEvmTxRelayerCandidate = (): boolean | null => {
  const { free } = useBalances();
  const { network } = useNetworkStore();

  if (free === null) {
    return null;
  }

  return free.isZero() && network.evmTxRelayerEndpoint !== undefined;
};

export default useIsEvmTxRelayerCandidate;
