import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

/** @deprecated Use useExecuteWithdrawTx from tangle-shared-ui instead */
const useRestakeWithdrawExecuteTx = () => {
  // Return no-op function that logs deprecation warning
  const execute = async (): Promise<void> => {
    console.warn(
      'useRestakeWithdrawExecuteTx is deprecated. Use useExecuteWithdrawTx instead.',
    );
  };

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useRestakeWithdrawExecuteTx;
