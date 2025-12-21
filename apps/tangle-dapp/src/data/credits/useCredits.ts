import { useMemo } from 'react';
import { useReadContract, useChainId } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { type Hex, zeroAddress } from 'viem';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import CREDITS_MERKLE_ABI from '@tangle-network/tangle-shared-ui/abi/creditsMerkle';
import {
  loadCreditsTreeData,
  lookupCreditsClaim,
  type CreditsClaimData,
  type CreditsTreeData,
} from '@tangle-network/tangle-shared-ui/data/credits';
import {
  resolveCreditsAddress,
  resolveCreditsTreeUrl,
} from './resolveCreditsAddress';

// This represents the structure of our credits data
export type CreditsData = {
  amount: bigint;
  totalAmount: bigint;
  epochId: bigint;
  merkleProof: Hex[];
  root: Hex;
  hasClaimed: boolean;
};

export default function useCredits() {
  const activeEvmAddress = useEvmAddress();
  const chainId = useChainId();
  const creditsAddress = resolveCreditsAddress(chainId);
  const isSupportedNetwork = creditsAddress !== null;
  const creditsTreeUrl = resolveCreditsTreeUrl(chainId);

  const {
    data: creditsTree,
    isLoading: isLoadingTree,
    error: treeError,
    refetch: refetchTree,
  } = useQuery<CreditsTreeData>({
    queryKey: ['credits-tree', creditsTreeUrl],
    queryFn: async () => {
      const response = await fetch(creditsTreeUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch credits data');
      }
      const json = await response.text();
      return loadCreditsTreeData(json);
    },
    enabled: isSupportedNetwork,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const claimData = useMemo<CreditsClaimData | null>(() => {
    if (!activeEvmAddress || !creditsTree) {
      return null;
    }

    return lookupCreditsClaim(creditsTree, activeEvmAddress);
  }, [activeEvmAddress, creditsTree]);

  const {
    data: onchainRoot,
    isLoading: isLoadingRoot,
    error: rootError,
    refetch: refetchRoot,
  } = useReadContract({
    address: creditsAddress ?? zeroAddress,
    abi: CREDITS_MERKLE_ABI,
    functionName: 'merkleRoots',
    args: claimData ? [claimData.epochId] : undefined,
    query: {
      enabled: isSupportedNetwork && claimData !== null,
      refetchInterval: 30000,
    },
  });

  const {
    data: hasClaimed,
    isLoading: isLoadingClaimed,
    error: claimedError,
    refetch: refetchClaimed,
  } = useReadContract({
    address: creditsAddress ?? zeroAddress,
    abi: CREDITS_MERKLE_ABI,
    functionName: 'claimed',
    args:
      claimData && activeEvmAddress
        ? [claimData.epochId, activeEvmAddress as `0x${string}`]
        : undefined,
    query: {
      enabled:
        isSupportedNetwork && claimData !== null && activeEvmAddress !== null,
      refetchInterval: 10000,
    },
  });

  const rootMatches = useMemo(() => {
    if (!claimData || !onchainRoot) {
      return false;
    }
    return claimData.root.toLowerCase() === (onchainRoot as Hex).toLowerCase();
  }, [claimData, onchainRoot]);

  const data = useMemo<CreditsData | null>(() => {
    if (!claimData || !rootMatches) {
      return null;
    }

    const alreadyClaimed = Boolean(hasClaimed);
    return {
      amount: alreadyClaimed ? BigInt(0) : claimData.amount,
      totalAmount: claimData.amount,
      epochId: claimData.epochId,
      merkleProof: claimData.merkleProof,
      root: claimData.root,
      hasClaimed: alreadyClaimed,
    };
  }, [claimData, hasClaimed, rootMatches]);

  const rootMismatchError =
    claimData && onchainRoot && !rootMatches
      ? new Error('Credits root mismatch')
      : null;

  const mergedError = (treeError ??
    rootError ??
    claimedError ??
    rootMismatchError) as Error | null;

  return {
    data,
    isPending: isLoadingTree || isLoadingRoot || isLoadingClaimed,
    isSupportedNetwork,
    isError: isSupportedNetwork ? mergedError !== null : false,
    error: isSupportedNetwork ? mergedError : null,
    refetch: async () => {
      await Promise.all([refetchTree(), refetchRoot(), refetchClaimed()]);
      return null;
    },
  };
}
