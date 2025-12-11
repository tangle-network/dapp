import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { BN } from '@tangle-network/tangle-shared-ui/bn';

type WithdrawCancelRequest = {
  amount: BN;
  assetId: RestakeAssetId;
};

/** @deprecated Withdraw cancel is not supported in EVM-only mode */
const useRestakeWithdrawCancelTx = () => {
  // Return no-op function that logs deprecation warning
  const execute = async (_requests: WithdrawCancelRequest[]): Promise<void> => {
    console.warn(
      'useRestakeWithdrawCancelTx is deprecated. Withdraw cancel is not supported in EVM-only mode.',
    );
  };

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useRestakeWithdrawCancelTx;
