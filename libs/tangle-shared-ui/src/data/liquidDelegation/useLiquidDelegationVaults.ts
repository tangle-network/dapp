/**
 * Hook for fetching all liquid delegation vaults from the factory contract.
 */

import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { Address } from 'viem';
import LIQUID_DELEGATION_FACTORY_ABI from '../../abi/liquidDelegationFactory';
import LIQUID_DELEGATION_VAULT_ABI from '../../abi/liquidDelegationVault';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useMemo } from 'react';

export type LiquidDelegationVault = {
  address: Address;
  operator: Address;
  asset: Address;
  blueprintIds: bigint[];
  selectionMode: number;
  name: string;
  symbol: string;
  totalAssets: bigint;
  totalSupply: bigint;
};

/**
 * Hook to fetch all liquid delegation vaults from the factory.
 *
 * @example
 * ```tsx
 * const { vaults, isLoading, error } = useLiquidDelegationVaults();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <VaultList>
 *     {vaults?.map(vault => (
 *       <VaultCard key={vault.address} vault={vault} />
 *     ))}
 *   </VaultList>
 * );
 * ```
 */
export const useLiquidDelegationVaults = () => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);

  // Fetch all vault addresses from factory
  const {
    data: vaultAddresses,
    isLoading: isLoadingAddresses,
    error: addressesError,
    refetch: refetchAddresses,
  } = useReadContract({
    address: contracts.liquidDelegationFactory,
    abi: LIQUID_DELEGATION_FACTORY_ABI,
    functionName: 'getAllVaults',
  });

  // Build contract calls for vault details
  const vaultDetailCalls = useMemo(() => {
    if (!vaultAddresses || vaultAddresses.length === 0) {
      return [];
    }

    return vaultAddresses.flatMap((vaultAddress) => [
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'operator' as const,
      },
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'asset' as const,
      },
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'blueprintIds' as const,
      },
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'selectionMode' as const,
      },
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'totalAssets' as const,
      },
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'totalSupply' as const,
      },
    ]);
  }, [vaultAddresses]);

  // Fetch vault details in batch
  const {
    data: vaultDetailsData,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useReadContracts({
    contracts: vaultDetailCalls,
    query: {
      enabled: vaultAddresses !== undefined && vaultAddresses.length > 0,
    },
  });

  // Process vault data
  const vaults = useMemo<LiquidDelegationVault[] | null>(() => {
    if (!vaultAddresses || !vaultDetailsData) {
      return null;
    }

    const CALLS_PER_VAULT = 6;
    const result: LiquidDelegationVault[] = [];

    for (let i = 0; i < vaultAddresses.length; i++) {
      const baseIndex = i * CALLS_PER_VAULT;
      const operatorResult = vaultDetailsData[baseIndex];
      const assetResult = vaultDetailsData[baseIndex + 1];
      const blueprintIdsResult = vaultDetailsData[baseIndex + 2];
      const selectionModeResult = vaultDetailsData[baseIndex + 3];
      const totalAssetsResult = vaultDetailsData[baseIndex + 4];
      const totalSupplyResult = vaultDetailsData[baseIndex + 5];

      // Skip if any required data is missing
      if (
        operatorResult?.status !== 'success' ||
        assetResult?.status !== 'success' ||
        blueprintIdsResult?.status !== 'success' ||
        selectionModeResult?.status !== 'success' ||
        totalAssetsResult?.status !== 'success' ||
        totalSupplyResult?.status !== 'success'
      ) {
        continue;
      }

      result.push({
        address: vaultAddresses[i],
        operator: operatorResult.result as Address,
        asset: assetResult.result as Address,
        blueprintIds: blueprintIdsResult.result as bigint[],
        selectionMode: selectionModeResult.result as number,
        // TODO: Fetch name/symbol from ERC20 metadata
        name: `Liquid Delegation Vault`,
        symbol: `ldTKN`,
        totalAssets: totalAssetsResult.result as bigint,
        totalSupply: totalSupplyResult.result as bigint,
      });
    }

    return result;
  }, [vaultAddresses, vaultDetailsData]);

  return {
    vaults,
    isLoading: isLoadingAddresses || isLoadingDetails,
    error: addressesError || detailsError,
    refetch: refetchAddresses,
  };
};

export default useLiquidDelegationVaults;
