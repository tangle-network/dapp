/**
 * Hook for fetching user's position in a LiquidDelegationVault.
 * Returns balance, pending redemptions, and claimable amounts.
 */

import { useReadContracts, useAccount } from 'wagmi';
import { Address } from 'viem';
import LIQUID_DELEGATION_VAULT_ABI from '../../abi/liquidDelegationVault';
import { useMemo } from 'react';

export type VaultUserPosition = {
  balance: bigint;
  balanceInAssets: bigint;
};

/**
 * Hook to fetch user's position in a liquid delegation vault.
 *
 * @example
 * ```tsx
 * const { position, isLoading, error } = useVaultUserPosition(vaultAddress);
 *
 * if (position) {
 *   console.log('Balance:', position.balance);
 *   console.log('Value in assets:', position.balanceInAssets);
 * }
 * ```
 */
export const useVaultUserPosition = (vaultAddress: Address | undefined) => {
  const { address: userAddress } = useAccount();

  const contracts = useMemo(() => {
    if (!vaultAddress || !userAddress) {
      return [];
    }

    return [
      {
        address: vaultAddress,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'balanceOf' as const,
        args: [userAddress] as const,
      },
    ];
  }, [vaultAddress, userAddress]);

  const {
    data: results,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  // Fetch conversion for balance to assets
  const balance =
    results?.[0]?.status === 'success'
      ? (results[0].result as bigint)
      : BigInt(0);

  const { data: conversionResults } = useReadContracts({
    contracts:
      balance > BigInt(0) && vaultAddress
        ? [
            {
              address: vaultAddress,
              abi: LIQUID_DELEGATION_VAULT_ABI,
              functionName: 'convertToAssets' as const,
              args: [balance] as const,
            },
          ]
        : [],
    query: {
      enabled: balance > BigInt(0),
    },
  });

  const position = useMemo<VaultUserPosition | null>(() => {
    if (!results || results[0]?.status !== 'success') {
      return null;
    }

    const balanceInAssets =
      conversionResults?.[0]?.status === 'success'
        ? (conversionResults[0].result as bigint)
        : BigInt(0);

    return {
      balance,
      balanceInAssets,
    };
  }, [results, conversionResults, balance]);

  return {
    position,
    isLoading,
    error,
    refetch,
  };
};

export default useVaultUserPosition;
