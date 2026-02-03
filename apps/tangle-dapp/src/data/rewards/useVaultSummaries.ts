/**
 * Hook for fetching all vault summaries from RewardVaults contract.
 * Returns vault data including APY, deposit cap, total deposits, and total score.
 */

import { useMemo } from 'react';
import { useReadContract, useChainId } from 'wagmi';
import { Address } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import REWARD_VAULTS_ABI from '@tangle-network/tangle-shared-ui/abi/rewardVaults';

export interface VaultSummary {
  asset: Address;
  depositCap: bigint;
  active: boolean;
  totalDeposits: bigint;
  totalScore: bigint;
  rewardsDistributed: bigint;
  depositCapRemaining: bigint;
  utilizationBps: bigint;
}

export interface VaultSummariesData {
  vaults: VaultSummary[];
  totalDeposits: bigint;
  totalScore: bigint;
}

interface UseVaultSummariesOptions {
  enabled?: boolean;
}

const useVaultSummaries = (options?: UseVaultSummariesOptions) => {
  const enabled = options?.enabled ?? true;
  const chainId = useChainId();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  const {
    data: summariesResult,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: contracts?.rewardVaults,
    abi: REWARD_VAULTS_ABI,
    functionName: 'getAllVaultSummaries',
    query: {
      enabled: enabled && !!contracts,
      refetchInterval: enabled ? 30000 : false, // Refresh every 30 seconds
    },
  });

  const data = useMemo<VaultSummariesData | null>(() => {
    if (!summariesResult) {
      return null;
    }

    const vaults = summariesResult as VaultSummary[];
    let totalDeposits = BigInt(0);
    let totalScore = BigInt(0);

    for (const vault of vaults) {
      if (vault.active) {
        totalDeposits += vault.totalDeposits;
        totalScore += vault.totalScore;
      }
    }

    return {
      vaults,
      totalDeposits,
      totalScore,
    };
  }, [summariesResult]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch,
  };
};

export default useVaultSummaries;
