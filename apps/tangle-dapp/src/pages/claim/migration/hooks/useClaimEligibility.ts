import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type Hex, formatUnits, keccak256, toHex } from 'viem';
import { useReadContract } from 'wagmi';
import {
  lookupClaim,
  loadMerkleTreeData,
  type MigrationProofsData,
  type ClaimData,
} from '@tangle-network/tangle-shared-ui/data/migration';

// TangleMigration contract ABI (partial - only what we need)
const TANGLE_MIGRATION_ABI = [
  {
    name: 'claimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'addressHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getClaimedAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'originalAddress', type: 'string' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'claimDeadline',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'merkleRoot',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const;

/**
 * The URL where the proofs data is hosted
 */
const PROOFS_URL =
  import.meta.env.VITE_MIGRATION_PROOFS_URL || '/data/migration-proofs.json';

/**
 * TangleMigration contract address (to be set after deployment)
 */
const TANGLE_MIGRATION_ADDRESS =
  (import.meta.env.VITE_TANGLE_MIGRATION_ADDRESS as Hex) || null;

export interface ClaimEligibility {
  /** Whether the SS58 address is eligible for a claim */
  isEligible: boolean;
  /** The claimable amount (if eligible) */
  amount: bigint | null;
  /** The Merkle proof for the claim */
  merkleProof: Hex[] | null;
  /** Whether this address has already claimed */
  hasClaimed: boolean;
  /** Amount already claimed (0 if not claimed) */
  claimedAmount: bigint;
  /** Time remaining for claims (in seconds) */
  timeRemaining: bigint;
  /** Formatted balance for display */
  formattedBalance: string | null;
  /** Whether claims are paused */
  isPaused: boolean;
}

interface UseClaimEligibilityOptions {
  /** The SS58 Substrate address to check */
  ss58Address: string | null;
}

/**
 * Generate a challenge message for signing
 * The challenge includes the contract address, chain ID, recipient address, and amount
 * This binds the signature to a specific claim, preventing replay attacks
 */
export const generateChallenge = (
  contractAddress: Hex,
  chainId: number,
  recipientAddress: Hex,
  amount: bigint,
): Hex => {
  // Challenge format: keccak256(abi.encodePacked(contractAddress, chainId, recipientAddress, amount))
  // Including amount provides defense in depth - signature is bound to specific claim
  return keccak256(
    `${contractAddress}${toHex(BigInt(chainId)).slice(2).padStart(64, '0')}${recipientAddress.slice(2).padStart(40, '0')}${toHex(amount).slice(2).padStart(64, '0')}` as Hex,
  );
};

/**
 * Hook to check claim eligibility for an SS58 Substrate address
 */
const useClaimEligibility = ({ ss58Address }: UseClaimEligibilityOptions) => {
  // Fetch the proofs data
  const {
    data: proofsData,
    isLoading: isLoadingProofs,
    error: proofsError,
  } = useQuery<MigrationProofsData | null>({
    queryKey: ['migration-proofs'],
    queryFn: async () => {
      try {
        const response = await fetch(PROOFS_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch migration proofs data');
        }
        const json = await response.text();
        return loadMerkleTreeData(json);
      } catch (error) {
        console.error('Failed to load migration proofs:', error);
        return null;
      }
    },
    staleTime: Infinity, // Proofs data is static
    gcTime: 24 * 60 * 60 * 1000, // Keep for 24 hours
    retry: 3,
  });

  // Check claimed amount on-chain using the string address
  const { data: claimedAmount, isLoading: isLoadingClaimed } = useReadContract({
    address: TANGLE_MIGRATION_ADDRESS ?? undefined,
    abi: TANGLE_MIGRATION_ABI,
    functionName: 'getClaimedAmount',
    args: ss58Address ? [ss58Address] : undefined,
    query: {
      enabled: !!ss58Address && !!TANGLE_MIGRATION_ADDRESS,
    },
  });

  // Get claim deadline
  const { data: claimDeadline, isLoading: isLoadingDeadline } = useReadContract(
    {
      address: TANGLE_MIGRATION_ADDRESS ?? undefined,
      abi: TANGLE_MIGRATION_ABI,
      functionName: 'claimDeadline',
      query: {
        enabled: !!TANGLE_MIGRATION_ADDRESS,
        refetchInterval: 60000, // Refresh every minute
      },
    },
  );

  // Check if paused
  const { data: isPaused, isLoading: isLoadingPaused } = useReadContract({
    address: TANGLE_MIGRATION_ADDRESS ?? undefined,
    abi: TANGLE_MIGRATION_ABI,
    functionName: 'paused',
    query: {
      enabled: !!TANGLE_MIGRATION_ADDRESS,
    },
  });

  // Get merkle root for verification
  const { data: merkleRoot } = useReadContract({
    address: TANGLE_MIGRATION_ADDRESS ?? undefined,
    abi: TANGLE_MIGRATION_ABI,
    functionName: 'merkleRoot',
    query: {
      enabled: !!TANGLE_MIGRATION_ADDRESS,
    },
  });

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!claimDeadline) return BigInt(0);
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (claimDeadline <= now) return BigInt(0);
    return claimDeadline - now;
  }, [claimDeadline]);

  // Compute eligibility from proofs data
  const claimData = useMemo((): ClaimData | null => {
    if (!ss58Address || !proofsData) {
      return null;
    }
    return lookupClaim(proofsData, ss58Address);
  }, [ss58Address, proofsData]);

  // Build eligibility object
  const eligibility = useMemo((): ClaimEligibility => {
    const actualClaimedAmount = claimedAmount ?? BigInt(0);
    const hasClaimed = actualClaimedAmount > BigInt(0);

    if (!claimData) {
      return {
        isEligible: false,
        amount: null,
        merkleProof: null,
        hasClaimed,
        claimedAmount: actualClaimedAmount,
        timeRemaining,
        formattedBalance: null,
        isPaused: isPaused ?? false,
      };
    }

    const formattedBalance = formatUnits(claimData.amount, 18);

    return {
      isEligible: true,
      amount: claimData.amount,
      merkleProof: claimData.merkleProof,
      hasClaimed,
      claimedAmount: actualClaimedAmount,
      timeRemaining,
      formattedBalance,
      isPaused: isPaused ?? false,
    };
  }, [claimData, claimedAmount, timeRemaining, isPaused]);

  const isLoading =
    isLoadingProofs || isLoadingClaimed || isLoadingDeadline || isLoadingPaused;

  return {
    eligibility,
    isLoading,
    error: proofsError,
    merkleRoot: merkleRoot ?? null,
    contractAddress: TANGLE_MIGRATION_ADDRESS,
    contractConfigured: !!TANGLE_MIGRATION_ADDRESS,
  };
};

export default useClaimEligibility;
