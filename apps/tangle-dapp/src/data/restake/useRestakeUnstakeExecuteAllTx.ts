import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

type ExecuteAllContext = {
  nominatedOperators: SubstrateAddress[];
  hasDepositedRequests: boolean;
  hasNonNativeRequests: boolean;
};

/** @deprecated Use useExecuteUnstakeTx from tangle-shared-ui instead */
const useRestakeUnstakeExecuteAllTx = () => {
  // Return null execute but with proper typing to avoid "never" type narrowing
  const execute: ((context: ExecuteAllContext) => Promise<void>) | null = null;

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useRestakeUnstakeExecuteAllTx;
