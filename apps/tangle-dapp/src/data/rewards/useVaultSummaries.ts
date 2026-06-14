/**
 * Hook for fetching all vault summaries from RewardVaults contract.
 * Returns vault data including APY, deposit cap, total deposits, and total score.
 */

import { useMemo } from 'react';
import { useReadContract, useChainId, useConnectorClient } from 'wagmi';
import { Address } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import REWARD_VAULTS_ABI from '@tangle-network/tangle-shared-ui/abi/rewardVaults';
import { POLLING_INTERVALS } from './constants';

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
  const { data: connectorClient } = useConnectorClient();
  const effectiveChainId = connectorClient?.chain?.id ?? chainId;

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(effectiveChainId);
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
    chainId: effectiveChainId,
    query: {
      enabled: enabled && !!contracts,
      refetchInterval: enabled ? POLLING_INTERVALS.VAULT_SUMMARIES : false,
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
