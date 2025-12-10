import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { BN } from '@polkadot/util';

type JoinOperatorsContext = {
  bondAmount: BN;
};

/** @deprecated Use EVM MultiAssetDelegation instead */
const useJoinOperatorsTx = () => {
  // Return null execute but with proper typing to avoid "never" type narrowing
  const execute: ((context: JoinOperatorsContext) => Promise<void>) | null =
    null;

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useJoinOperatorsTx;
