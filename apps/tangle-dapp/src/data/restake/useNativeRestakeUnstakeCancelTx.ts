import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

/** @deprecated Native unstake cancel is not supported in EVM-only mode */
const useNativeRestakeUnstakeCancelTx = () => {
  // Return null execute but with proper typing to avoid "never" type narrowing
  const execute: ((operators: SubstrateAddress[]) => Promise<void>) | null =
    null;

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useNativeRestakeUnstakeCancelTx;
