import { useMemo } from 'react';
import { useReadContracts, useChainId, useAccount } from 'wagmi';
import { Address } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import REWARD_VAULTS_ABI from '@tangle-network/tangle-shared-ui/abi/rewardVaults';
import { POLLING_INTERVALS } from './constants';

export type PendingReward = {
  operator: Address;
  amount: bigint;
};

export type VaultPendingRewards = {
  asset: Address;
  rewards: PendingReward[];
  totalPending: bigint;
};

export type PendingRewardsData = {
  vaults: VaultPendingRewards[];
  totalPendingRewards: bigint;
  hasRewards: boolean;
};

interface UsePendingRewardsOptions {
  enabled?: boolean;
}

const usePendingRewards = (options?: UsePendingRewardsOptions) => {
  const enabled = options?.enabled ?? true;
  const chainId = useChainId();
  const { address: userAddress } = useAccount();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  // First, fetch all vault assets
  const {
    data: vaultAssets,
    isLoading: isLoadingAssets,
    error: assetsError,
  } = useReadContracts({
    contracts:
      enabled && contracts && userAddress
        ? [
            {
              address: contracts.rewardVaults,
              abi: REWARD_VAULTS_ABI,
              functionName: 'getVaultAssets',
            },
          ]
        : [],
    query: {
      enabled: enabled && !!contracts && !!userAddress,
    },
  });

  const assetAddresses = useMemo(() => {
    if (!vaultAssets || vaultAssets[0]?.status !== 'success') {
      return [];
    }
    return vaultAssets[0].result as Address[];
  }, [vaultAssets]);

  // For each asset, fetch pending rewards for the user
  const rewardContracts = useMemo(() => {
    if (!contracts || !userAddress || assetAddresses.length === 0) {
      return [];
    }

    return assetAddresses.map((asset) => ({
      address: contracts.rewardVaults,
      abi: REWARD_VAULTS_ABI,
      functionName: 'pendingDelegatorRewardsAll' as const,
      args: [asset, userAddress] as const,
    }));
  }, [contracts, userAddress, assetAddresses]);

  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    error: rewardsError,
    refetch,
  } = useReadContracts({
    contracts: enabled ? rewardContracts : [],
    query: {
      enabled: enabled && rewardContracts.length > 0,
      refetchInterval: enabled ? POLLING_INTERVALS.PENDING_REWARDS : false,
    },
  });

  const data = useMemo<PendingRewardsData | null>(() => {
    if (!rewardsData || assetAddresses.length === 0) {
      return null;
    }

    const vaults: VaultPendingRewards[] = [];
    let totalPendingRewards = BigInt(0);

    for (let i = 0; i < assetAddresses.length; i++) {
      const result = rewardsData[i];
      if (result?.status !== 'success') {
        continue;
      }

      const [rewards, totalPending] = result.result as [
        { operator: Address; amount: bigint }[],
        bigint,
      ];

      if (totalPending > BigInt(0)) {
        vaults.push({
          asset: assetAddresses[i],
          rewards: rewards.map((r) => ({
            operator: r.operator,
            amount: r.amount,
          })),
          totalPending,
        });
        totalPendingRewards += totalPending;
      }
    }

    return {
      vaults,
      totalPendingRewards,
      hasRewards: totalPendingRewards > BigInt(0),
    };
  }, [rewardsData, assetAddresses]);

  return {
    data,
    isLoading: isLoadingAssets || isLoadingRewards,
    isError: !!assetsError || !!rewardsError,
    error: assetsError || rewardsError,
    refetch,
  };
};

export default usePendingRewards;
