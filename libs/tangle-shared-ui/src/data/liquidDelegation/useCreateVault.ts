/**
 * Hooks for creating new LiquidDelegationVault instances via the factory contract.
 */

import { Address } from 'viem';
import { useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import useContractWrite from '../../hooks/useContractWrite';
import LIQUID_DELEGATION_FACTORY_ABI from '../../abi/liquidDelegationFactory';

export interface CreateVaultParams {
  /** Operator address that will manage the vault's delegations */
  operator: Address;
  /** ERC20 asset address that the vault will accept for deposits */
  asset: Address;
  /** Array of blueprint IDs the vault will delegate to */
  blueprintIds: bigint[];
}

export interface CreateAllBlueprintsVaultParams {
  /** Operator address that will manage the vault's delegations */
  operator: Address;
  /** ERC20 asset address that the vault will accept for deposits */
  asset: Address;
}

/**
 * Hook to create a new LiquidDelegationVault with specific blueprint IDs.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useCreateVault();
 *
 * // Create vault for USDC delegating to blueprints 0 and 1
 * await execute({
 *   operator: operatorAddress,
 *   asset: usdcAddress,
 *   blueprintIds: [BigInt(0), BigInt(1)],
 * });
 * ```
 */
export const useCreateVault = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    LIQUID_DELEGATION_FACTORY_ABI,
    (params: CreateVaultParams, _activeAddress) => ({
      address: contracts.liquidDelegationFactory,
      abi: LIQUID_DELEGATION_FACTORY_ABI,
      functionName: 'createVault' as const,
      args: [params.operator, params.asset, params.blueprintIds] as const,
    }),
    {
      txName: 'liquid create vault',
      txDetails: (params) =>
        new Map([
          ['Operator', params.operator],
          ['Asset', params.asset],
          ['Blueprints', params.blueprintIds.length.toString()],
        ]),
      getSuccessMessage: (_params) =>
        `Successfully created liquid delegation vault`,
    },
  );
};

/**
 * Hook to create a new LiquidDelegationVault that delegates to ALL blueprints.
 * This is simpler than specifying individual blueprint IDs.
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useCreateAllBlueprintsVault();
 *
 * // Create vault for WETH delegating to all available blueprints
 * await execute({
 *   operator: operatorAddress,
 *   asset: wethAddress,
 * });
 * ```
 */
export const useCreateAllBlueprintsVault = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  return useContractWrite(
    LIQUID_DELEGATION_FACTORY_ABI,
    (params: CreateAllBlueprintsVaultParams, _activeAddress) => ({
      address: contracts.liquidDelegationFactory,
      abi: LIQUID_DELEGATION_FACTORY_ABI,
      functionName: 'createAllBlueprintsVault' as const,
      args: [params.operator, params.asset] as const,
    }),
    {
      txName: 'liquid create vault',
      txDetails: (params) =>
        new Map([
          ['Operator', params.operator],
          ['Asset', params.asset],
          ['Blueprints', 'all'],
        ]),
      getSuccessMessage: (_params) =>
        `Successfully created all-blueprints liquid delegation vault`,
    },
  );
};

export default useCreateVault;
