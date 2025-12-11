/**
 * Hook for delegating assets to an operator.
 * Replaces the Substrate-based useRestakeDelegateTx hook.
 */

import { Address } from 'viem';
import useContractWrite from '../../hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { BlueprintSelectionMode } from '../graphql/useDelegator';

// Blueprint selection mode values (matching contract)
// 0 = ALL (delegate to all blueprints the operator supports)
// 1 = FIXED (delegate to specific blueprints)
const SELECTION_MODE_VALUES: Record<BlueprintSelectionMode, number> = {
  ALL: 0,
  FIXED: 1,
};

export interface DelegateParams {
  operator: Address;
  token: Address;
  amount: bigint;
  blueprintSelection?: BlueprintSelectionMode;
  blueprintIds?: bigint[];
}

/**
 * Hook to delegate assets to an operator.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useDelegateTx();
 *
 * // Delegate to operator for all blueprints
 * await execute({
 *   operator: '0x...',
 *   token: '0x...',
 *   amount: parseUnits('100', 18),
 * });
 *
 * // Delegate to specific blueprints
 * await execute({
 *   operator: '0x...',
 *   token: '0x...',
 *   amount: parseUnits('100', 18),
 *   blueprintSelection: 'FIXED',
 *   blueprintIds: [1n, 2n, 3n],
 * });
 * ```
 */
export const useDelegateTx = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    MULTI_ASSET_DELEGATION_ABI,
    (params: DelegateParams, _activeAddress) => ({
      address: contracts.multiAssetDelegation,
      abi: MULTI_ASSET_DELEGATION_ABI,
      functionName: 'delegateWithOptions' as const,
      args: [
        params.operator,
        params.token,
        params.amount,
        SELECTION_MODE_VALUES[params.blueprintSelection ?? 'ALL'],
        (params.blueprintIds ?? []).map((id) => BigInt(id)),
      ] as const,
    }),
    {
      getSuccessMessage: (params) =>
        `Successfully delegated ${params.amount.toString()} to operator`,
    },
  );
};

export default useDelegateTx;
