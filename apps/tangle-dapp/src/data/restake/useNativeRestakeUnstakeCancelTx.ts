import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

/** @deprecated Native unstake cancel is not supported in EVM-only mode */
const useNativeRestakeUnstakeCancelTx = () => {
  // Return no-op function that logs deprecation warning
  const execute = async (_operators: SubstrateAddress[]): Promise<void> => {
    console.warn(
      'useNativeRestakeUnstakeCancelTx is deprecated. Native unstake cancel is not supported in EVM-only mode.',
    );
  };

  return {
    execute,
    status: TxStatus.NOT_YET_INITIATED,
  };
};

export default useNativeRestakeUnstakeCancelTx;
