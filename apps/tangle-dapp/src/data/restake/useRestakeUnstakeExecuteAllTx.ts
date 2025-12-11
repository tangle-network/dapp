import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

type ExecuteAllContext = {
  nominatedOperators: SubstrateAddress[];
  hasDepositedRequests: boolean;
  hasNonNativeRequests: boolean;
};

/** @deprecated Use useExecuteUnstakeTx from tangle-shared-ui instead */
const useRestakeUnstakeExecuteAllTx = () => {
  // Return no-op function that logs deprecation warning
  const execute = async (_context: ExecuteAllContext): Promise<void> => {
    console.warn(
      'useRestakeUnstakeExecuteAllTx is deprecated. Use useExecuteUnstakeTx instead.',
    );
  };

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useRestakeUnstakeExecuteAllTx;
