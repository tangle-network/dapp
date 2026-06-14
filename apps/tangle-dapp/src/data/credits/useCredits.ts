import { useEffect, useMemo, useState } from 'react';
import { useChainId, useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { type Hex, type Address } from 'viem';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import CREDITS_MERKLE_ABI from '@tangle-network/tangle-shared-ui/abi/creditsMerkle';
import {
  loadCreditsTreeData,
  lookupCreditsClaim,
  getCreditsWindow,
  verifyCreditsClaim,
  type CreditsClaimData,
  type CreditsTreeData,
  type CreditsWindow,
} from '@tangle-network/tangle-shared-ui/data/credits';
import {
  resolveCreditsAddress,
  resolveCreditsTreeUrl,
} from './resolveCreditsAddress';

const getNowSeconds = () => BigInt(Math.floor(Date.now() / 1000));

// This represents the structure of our credits data
export type CreditsData = {
  amount: bigint;
  totalAmount: bigint;
  epochId: bigint;
  merkleProof: Hex[];
  root: Hex;
  hasClaimed: boolean;
  window: CreditsWindow | null;
  timeRemaining: bigint;
  isClaimable: boolean;
};

export default function useCredits() {
  const activeEvmAddress = useEvmAddress();
  const chainId = useChainId();
  const [nowSeconds, setNowSeconds] = useState(getNowSeconds);
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowSeconds(getNowSeconds());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const claimData = useMemo<CreditsClaimData | null>(() => {
    if (!activeEvmAddress || !creditsTree) {
      return null;
    }

    return lookupCreditsClaim(creditsTree, activeEvmAddress);
  }, [activeEvmAddress, creditsTree]);

  const creditsWindow = useMemo(() => {
    if (!creditsTree) return null;
    return getCreditsWindow(creditsTree);
  }, [creditsTree]);

  const timeRemaining = useMemo(() => {
    if (!creditsWindow) return BigInt(0);
    if (creditsWindow.endTs <= nowSeconds) return BigInt(0);
    return creditsWindow.endTs - nowSeconds;
  }, [creditsWindow, nowSeconds]);

  const {
    data: onchainRoot,
    isLoading: isLoadingRoot,
    error: rootError,
    refetch: refetchRoot,
  } = useReadContract({
    address: creditsAddress as Address,
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
    address: creditsAddress as Address,
    abi: CREDITS_MERKLE_ABI,
    functionName: 'claimed',
    args:
      claimData && activeEvmAddress
        ? [claimData.epochId, activeEvmAddress as Address]
        : undefined,
    query: {
      enabled:
        isSupportedNetwork && claimData !== null && activeEvmAddress !== null,
      staleTime: 10000,
      refetchInterval: 10000,
    },
  });

  const rootMatches = useMemo(() => {
    if (!claimData || !onchainRoot) {
      return false;
    }
    return claimData.root.toLowerCase() === onchainRoot.toLowerCase();
  }, [claimData, onchainRoot]);

  const proofValid = useMemo(() => {
    if (!claimData || !rootMatches) {
      return false;
    }
    return verifyCreditsClaim(claimData.root, claimData);
  }, [claimData, rootMatches]);

  const data = useMemo<CreditsData | null>(() => {
    if (!claimData || !rootMatches || !proofValid) {
      return null;
    }

    const alreadyClaimed = Boolean(hasClaimed);
    const windowComplete = creditsWindow
      ? nowSeconds >= creditsWindow.endTs
      : true;
    return {
      amount: alreadyClaimed ? BigInt(0) : claimData.amount,
      totalAmount: claimData.amount,
      epochId: claimData.epochId,
      merkleProof: claimData.merkleProof,
      root: claimData.root,
      hasClaimed: alreadyClaimed,
      window: creditsWindow,
      timeRemaining,
      isClaimable: windowComplete && !alreadyClaimed,
    };
  }, [
    claimData,
    creditsWindow,
    hasClaimed,
    proofValid,
    rootMatches,
    timeRemaining,
    nowSeconds,
  ]);

  const rootMismatchError =
    claimData && onchainRoot && !rootMatches
      ? new Error('Credits root mismatch')
      : null;
  const invalidProofError =
    claimData && rootMatches && !proofValid
      ? new Error('Credits proof invalid')
      : null;

  const mergedError = (treeError ??
    rootError ??
    claimedError ??
    rootMismatchError ??
    invalidProofError) as Error | null;

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
