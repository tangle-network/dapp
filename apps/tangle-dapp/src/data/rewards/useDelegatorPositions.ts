/**
 * Hook for fetching delegator positions from RewardVaults contract.
 * Returns user's positions across all vaults with boosted scores and lock info.
 */

import { useMemo } from 'react';
import { useReadContracts, useChainId, useAccount } from 'wagmi';
import { Address } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import REWARD_VAULTS_ABI from '@tangle-network/tangle-shared-ui/abi/rewardVaults';
import { POLLING_INTERVALS } from './constants';

export enum LockDuration {
  None = 0,
  OneMonth = 1,
  TwoMonths = 2,
  ThreeMonths = 3,
  SixMonths = 4,
}

// Lock multipliers in basis points (10000 = 1.0x)
export const LOCK_MULTIPLIERS: Record<LockDuration, number> = {
  [LockDuration.None]: 10000, // 1.0x
  [LockDuration.OneMonth]: 11000, // 1.1x
  [LockDuration.TwoMonths]: 12000, // 1.2x
  [LockDuration.ThreeMonths]: 14000, // 1.4x
  [LockDuration.SixMonths]: 16000, // 1.6x
};

export interface DelegatorPosition {
  operator: Address;
  stakedAmount: bigint;
  boostedScore: bigint;
  lockDuration: LockDuration;
  lockExpiry: bigint;
  pendingRewards: bigint;
}

export interface VaultPositions {
  asset: Address;
  positions: DelegatorPosition[];
  totalStakedAmount: bigint;
  totalBoostedScore: bigint;
}

export interface DelegatorPositionsData {
  vaultPositions: VaultPositions[];
  totalStakedAmount: bigint;
  totalBoostedScore: bigint;
  weightedAvgMultiplier: number; // Weighted by stake amount
}

interface UseDelegatorPositionsOptions {
  enabled?: boolean;
  vaultAssets?: Address[];
}

const useDelegatorPositions = (options?: UseDelegatorPositionsOptions) => {
  const enabled = options?.enabled ?? true;
  const chainId = useChainId();
  const { address: userAddress } = useAccount();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  // First, fetch all vault assets if not provided
  const {
    data: vaultAssetsResult,
    isLoading: isLoadingAssets,
    error: assetsError,
  } = useReadContracts({
    contracts:
      enabled && contracts && userAddress && !options?.vaultAssets
        ? [
            {
              address: contracts.rewardVaults,
              abi: REWARD_VAULTS_ABI,
              functionName: 'getVaultAssets',
            },
          ]
        : [],
    query: {
      enabled: enabled && !!contracts && !!userAddress && !options?.vaultAssets,
    },
  });

  const assetAddresses = useMemo(() => {
    if (options?.vaultAssets) {
      return options.vaultAssets;
    }
    if (!vaultAssetsResult || vaultAssetsResult[0]?.status !== 'success') {
      return [];
    }
    return vaultAssetsResult[0].result as Address[];
  }, [vaultAssetsResult, options?.vaultAssets]);

  // For each asset, fetch delegator positions
  const positionContracts = useMemo(() => {
    if (!contracts || !userAddress || assetAddresses.length === 0) {
      return [];
    }

    return assetAddresses.map((asset) => ({
      address: contracts.rewardVaults,
      abi: REWARD_VAULTS_ABI,
      functionName: 'getDelegatorPositions' as const,
      args: [asset, userAddress] as const,
    }));
  }, [contracts, userAddress, assetAddresses]);

  const {
    data: positionsData,
    isLoading: isLoadingPositions,
    error: positionsError,
    refetch,
  } = useReadContracts({
    contracts: enabled ? positionContracts : [],
    query: {
      enabled: enabled && positionContracts.length > 0,
      refetchInterval: enabled ? POLLING_INTERVALS.DELEGATOR_POSITIONS : false,
    },
  });

  const data = useMemo<DelegatorPositionsData | null>(() => {
    if (!positionsData || assetAddresses.length === 0) {
      return null;
    }

    const vaultPositions: VaultPositions[] = [];
    let totalStakedAmount = BigInt(0);
    let totalBoostedScore = BigInt(0);
    let weightedMultiplierSum = BigInt(0);

    for (let i = 0; i < assetAddresses.length; i++) {
      const result = positionsData[i];
      if (result?.status !== 'success') {
        continue;
      }

      const rawPositions = result.result as DelegatorPosition[];
      if (rawPositions.length === 0) {
        continue;
      }

      let vaultTotalStaked = BigInt(0);
      let vaultTotalBoosted = BigInt(0);
      let vaultWeightedMultiplierSum = BigInt(0);

      const positions: DelegatorPosition[] = rawPositions.map((p) => ({
        operator: p.operator,
        stakedAmount: p.stakedAmount,
        boostedScore: p.boostedScore,
        lockDuration: p.lockDuration as LockDuration,
        lockExpiry: p.lockExpiry,
        pendingRewards: p.pendingRewards,
      }));

      // Calculate totals separately to avoid closure warning
      for (const p of positions) {
        vaultTotalStaked += p.stakedAmount;
        vaultTotalBoosted += p.boostedScore;
        const multiplier = LOCK_MULTIPLIERS[p.lockDuration] || 10000;
        vaultWeightedMultiplierSum += p.stakedAmount * BigInt(multiplier);
      }

      weightedMultiplierSum += vaultWeightedMultiplierSum;

      if (vaultTotalStaked > BigInt(0)) {
        vaultPositions.push({
          asset: assetAddresses[i],
          positions,
          totalStakedAmount: vaultTotalStaked,
          totalBoostedScore: vaultTotalBoosted,
        });

        totalStakedAmount += vaultTotalStaked;
        totalBoostedScore += vaultTotalBoosted;
      }
    }

    // Calculate weighted average multiplier
    const weightedAvgMultiplier =
      totalStakedAmount > BigInt(0)
        ? Number(weightedMultiplierSum / totalStakedAmount) / 10000
        : 1.0;

    return {
      vaultPositions,
      totalStakedAmount,
      totalBoostedScore,
      weightedAvgMultiplier,
    };
  }, [positionsData, assetAddresses]);

  return {
    data,
    isLoading: isLoadingAssets || isLoadingPositions,
    isError: !!assetsError || !!positionsError,
    error: assetsError || positionsError,
    refetch,
  };
};

export default useDelegatorPositions;
