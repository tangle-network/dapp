/**
 * Hook for claiming delegator rewards from the MultiAssetDelegation contract.
 *
 * NOTE: The claimDelegatorRewards function has been removed from the contract ABI.
 * Rewards are now managed via a separate RewardsManager contract.
 * This hook is kept for API compatibility but returns a no-op.
 */

import { useCallback, useState } from 'react';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

/**
 * Hook to claim delegator rewards from MultiAssetDelegation.
 *
 * @deprecated Rewards claiming has been moved to a separate RewardsManager contract.
 * This hook returns a no-op for backwards compatibility.
 */
export const useClaimDelegatorRewardsTx = () => {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);

  // No-op execute function that does nothing
  const execute = useCallback(async () => {
    // Rewards claiming has been moved to RewardsManager contract
    // This is a no-op for backwards compatibility
    console.warn(
      'useClaimDelegatorRewardsTx: Rewards claiming has been moved to RewardsManager contract',
    );
    setStatus(TxStatus.ERROR);
    return null;
  }, []);

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
  }, []);

  return {
    execute,
    reset,
    status,
    error: null,
    txHash: null,
    result: null,
    successMessage: null,
    isLoading: false,
    isSuccess: false,
    isError: status === TxStatus.ERROR,
  };
};

export default useClaimDelegatorRewardsTx;
