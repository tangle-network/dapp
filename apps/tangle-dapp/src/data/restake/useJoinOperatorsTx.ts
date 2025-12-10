import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { BN } from '@polkadot/util';

type JoinOperatorsContext = {
  bondAmount: BN;
};

/** @deprecated Use EVM MultiAssetDelegation instead */
const useJoinOperatorsTx = () => {
  // Return no-op function that logs deprecation warning
  const execute = async (_context: JoinOperatorsContext): Promise<void> => {
    console.warn(
      'useJoinOperatorsTx is deprecated. Use EVM MultiAssetDelegation contract directly.',
    );
  };

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useJoinOperatorsTx;
