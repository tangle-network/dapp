import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

/** @deprecated Use useExecuteWithdrawTx from tangle-shared-ui instead */
const useRestakeWithdrawExecuteTx = () => {
  // Return null execute but with proper typing to avoid "never" type narrowing
  const execute: (() => Promise<void>) | null = null;

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useRestakeWithdrawExecuteTx;
