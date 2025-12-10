import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { BN } from '@polkadot/util';

type WithdrawCancelRequest = {
  amount: BN;
  assetId: RestakeAssetId;
};

/** @deprecated Withdraw cancel is not supported in EVM-only mode */
const useRestakeWithdrawCancelTx = () => {
  // Return null execute but with proper typing to avoid "never" type narrowing
  const execute: ((requests: WithdrawCancelRequest[]) => Promise<void>) | null =
    null;

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useRestakeWithdrawCancelTx;
