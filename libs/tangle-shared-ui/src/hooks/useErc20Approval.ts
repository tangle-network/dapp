/**
 * Hook for handling ERC20 token approvals.
 */

import { useCallback, useMemo } from 'react';
import { Address, erc20Abi, maxUint256 } from 'viem';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

export interface UseErc20ApprovalOptions {
  token: Address | undefined;
  spender: Address | undefined;
  amount: bigint;
  owner: Address | undefined;
  enabled?: boolean;
}

export const useErc20Approval = ({
  token,
  spender,
  amount,
  owner,
  enabled = true,
}: UseErc20ApprovalOptions) => {
  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: enabled && !!token && !!spender && !!owner,
    },
  });

  // Write approval
  const { writeContract, data: hash, isPending, reset } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const needsApproval = useMemo(() => {
    if (allowance === undefined) return false;
    return allowance < amount;
  }, [allowance, amount]);

  const approve = useCallback(() => {
    if (!token || !spender) return;

    writeContract({
      address: token,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, maxUint256],
    });
  }, [token, spender, writeContract]);

  return {
    allowance,
    needsApproval,
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    reset,
    refetchAllowance,
  };
};

export default useErc20Approval;
