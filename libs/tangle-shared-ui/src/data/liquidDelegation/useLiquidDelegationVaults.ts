/**
 * Hook for fetching all liquid delegation vaults from the factory contract.
 */

import { useChainId } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import LIQUID_DELEGATION_FACTORY_ABI from '../../abi/liquidDelegationFactory';
import LIQUID_DELEGATION_VAULT_ABI from '../../abi/liquidDelegationVault';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useMemo } from 'react';
import { useResilientReadContract } from '../../hooks/useResilientReadContract';
import { useResilientReadContracts } from '../../hooks/useResilientReadContracts';

export type LiquidDelegationVault = {
  address: Address;
  operator: Address;
  asset: Address;
  blueprintIds: bigint[];
  selectionMode: number;
  name: string;
  symbol: string;
  decimals: number;
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
  const factoryAddress = contracts.liquidDelegationFactory;
  const isFactoryConfigured =
    factoryAddress.toLowerCase() !== zeroAddress.toLowerCase();

  // Fetch all vault addresses from factory
  const {
    data: vaultAddresses,
    isLoading: isLoadingAddresses,
    error: addressesError,
    refetch: refetchAddresses,
  } = useResilientReadContract({
    queryKey: ['liquidDelegation', 'vaults', 'all', chainId] as const,
    contract: isFactoryConfigured
      ? {
          address: factoryAddress,
          abi: LIQUID_DELEGATION_FACTORY_ABI,
          functionName: 'getAllVaults',
        }
      : null,
    query: {
      enabled: isFactoryConfigured,
      staleTime: 2_000,
      refetchInterval: 5_000,
      refetchIntervalInBackground: true,
    },
  });

  const resolvedVaultAddresses = useMemo(() => {
    return (vaultAddresses as Address[] | null | undefined) ?? null;
  }, [vaultAddresses]);

  // Build contract calls for vault details
  const vaultDetailCalls = useMemo(() => {
    if (!resolvedVaultAddresses || resolvedVaultAddresses.length === 0) {
      return [];
    }

    return resolvedVaultAddresses.flatMap((vaultAddress) => [
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'name' as const,
      },
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'symbol' as const,
      },
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'decimals' as const,
      },
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
  }, [resolvedVaultAddresses]);

  // Fetch vault details in batch
  const {
    data: vaultDetailsData,
    isLoading: isLoadingDetails,
    error: detailsError,
    refetch: refetchDetails,
  } = useResilientReadContracts({
    queryKey: [
      'liquidDelegation',
      'vaults',
      'details',
      chainId,
      resolvedVaultAddresses ?? [],
    ] as const,
    contracts: vaultDetailCalls,
    query: {
      enabled:
        resolvedVaultAddresses !== null && resolvedVaultAddresses.length > 0,
      staleTime: 2_000,
      refetchInterval: 5_000,
      refetchIntervalInBackground: true,
    },
  });

  // Process vault data
  const vaults = useMemo<LiquidDelegationVault[] | null>(() => {
    if (!resolvedVaultAddresses || !vaultDetailsData) {
      return null;
    }

    const CALLS_PER_VAULT = 9;
    const result: LiquidDelegationVault[] = [];

    for (let i = 0; i < resolvedVaultAddresses.length; i++) {
      const baseIndex = i * CALLS_PER_VAULT;
      const nameResult = vaultDetailsData[baseIndex];
      const symbolResult = vaultDetailsData[baseIndex + 1];
      const decimalsResult = vaultDetailsData[baseIndex + 2];
      const operatorResult = vaultDetailsData[baseIndex + 3];
      const assetResult = vaultDetailsData[baseIndex + 4];
      const blueprintIdsResult = vaultDetailsData[baseIndex + 5];
      const selectionModeResult = vaultDetailsData[baseIndex + 6];
      const totalAssetsResult = vaultDetailsData[baseIndex + 7];
      const totalSupplyResult = vaultDetailsData[baseIndex + 8];

      // Skip if any required data is missing
      if (
        nameResult?.status !== 'success' ||
        symbolResult?.status !== 'success' ||
        decimalsResult?.status !== 'success' ||
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
        address: resolvedVaultAddresses[i],
        name: nameResult.result as string,
        symbol: symbolResult.result as string,
        decimals: Number(decimalsResult.result as number),
        operator: operatorResult.result as Address,
        asset: assetResult.result as Address,
        blueprintIds: blueprintIdsResult.result as bigint[],
        selectionMode: selectionModeResult.result as number,
        totalAssets: totalAssetsResult.result as bigint,
        totalSupply: totalSupplyResult.result as bigint,
      });
    }

    return result;
  }, [resolvedVaultAddresses, vaultDetailsData]);

  return {
    vaults,
    isLoading: isFactoryConfigured
      ? isLoadingAddresses || isLoadingDetails
      : false,
    error: isFactoryConfigured ? addressesError || detailsError : null,
    refetch: async () => {
      await Promise.all([refetchAddresses(), refetchDetails()]);
    },
  };
};

export default useLiquidDelegationVaults;
