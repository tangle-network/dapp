import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  type Hex,
  formatUnits,
  keccak256,
  encodeAbiParameters,
  createPublicClient,
  http,
} from 'viem';
import {
  lookupClaim,
  loadMerkleTreeData,
  ss58ToPubkey,
  type MigrationProofsData,
  type ClaimData,
} from '@tangle-network/tangle-shared-ui/data/migration';

/**
 * RPC URL for migration contract queries.
 * Uses a dedicated viem client to bypass wagmi chain routing issues.
 */
const MIGRATION_RPC_URL =
  import.meta.env.VITE_MIGRATION_RPC_URL || 'http://localhost:8545';

/**
 * Create a viem public client for direct contract reads.
 * This bypasses wagmi which has issues with chain routing.
 */
const publicClient = createPublicClient({
  transport: http(MIGRATION_RPC_URL),
});

// TangleMigration contract ABI (partial - only functions we use)
const TANGLE_MIGRATION_ABI = [
  {
    name: 'getClaimedAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'pubkey', type: 'bytes32' }],
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
  /** 32-byte pubkey derived from the SS58 address */
  pubkey: Hex | null;
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
  // Challenge format: keccak256(abi.encode(contractAddress, chainId, recipientAddress, amount))
  // Matches tnt-core TangleMigration expectedChallenge and SP1 program inputs.
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'address' },
        { type: 'uint256' },
      ],
      [contractAddress, BigInt(chainId), recipientAddress, amount],
    ),
  );
};

/**
 * Hook to check claim eligibility for an SS58 Substrate address
 */
const useClaimEligibility = ({ ss58Address }: UseClaimEligibilityOptions) => {
  const pubkeyFromSs58 = useMemo((): Hex | null => {
    if (!ss58Address) {
      return null;
    }
    try {
      return ss58ToPubkey(ss58Address);
    } catch {
      return null;
    }
  }, [ss58Address]);

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
      } catch {
        return null;
      }
    },
    staleTime: Infinity, // Proofs data is static
    gcTime: 24 * 60 * 60 * 1000, // Keep for 24 hours
    retry: 3,
  });

  // Check claimed amount on-chain using the pubkey (derived from SS58)
  // IMPORTANT: We use viem's publicClient directly because wagmi has routing issues
  // that cause it to return empty data even when the RPC works correctly.
  const { data: claimedAmount, isLoading: isLoadingClaimed } = useQuery<bigint>(
    {
      queryKey: [
        'migration-claimed-amount',
        pubkeyFromSs58,
        TANGLE_MIGRATION_ADDRESS,
      ],
      queryFn: async () => {
        if (!pubkeyFromSs58 || !TANGLE_MIGRATION_ADDRESS) {
          return BigInt(0);
        }
        const result = await publicClient.readContract({
          address: TANGLE_MIGRATION_ADDRESS,
          abi: TANGLE_MIGRATION_ABI,
          functionName: 'getClaimedAmount',
          args: [pubkeyFromSs58],
        });
        return result as bigint;
      },
      enabled: !!pubkeyFromSs58 && !!TANGLE_MIGRATION_ADDRESS,
      // Always refetch on mount and window focus to ensure we have the latest claimed status
      refetchOnMount: 'always',
      refetchOnWindowFocus: 'always',
      // Don't cache - always fetch fresh data for claim status
      staleTime: 0,
      gcTime: 0,
    },
  );

  // Get claim deadline using viem directly
  const { data: claimDeadline, isLoading: isLoadingDeadline } =
    useQuery<bigint>({
      queryKey: ['migration-claim-deadline', TANGLE_MIGRATION_ADDRESS],
      queryFn: async () => {
        if (!TANGLE_MIGRATION_ADDRESS) return BigInt(0);
        const result = await publicClient.readContract({
          address: TANGLE_MIGRATION_ADDRESS,
          abi: TANGLE_MIGRATION_ABI,
          functionName: 'claimDeadline',
        });
        return result as bigint;
      },
      enabled: !!TANGLE_MIGRATION_ADDRESS,
      refetchInterval: 60000, // Refresh every minute
    });

  // Check if paused using viem directly
  const { data: isPaused, isLoading: isLoadingPaused } = useQuery<boolean>({
    queryKey: ['migration-paused', TANGLE_MIGRATION_ADDRESS],
    queryFn: async () => {
      if (!TANGLE_MIGRATION_ADDRESS) return false;
      const result = await publicClient.readContract({
        address: TANGLE_MIGRATION_ADDRESS,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'paused',
      });
      return result as boolean;
    },
    enabled: !!TANGLE_MIGRATION_ADDRESS,
  });

  // Get merkle root for verification using viem directly
  const { data: merkleRoot } = useQuery<Hex | null>({
    queryKey: ['migration-merkle-root', TANGLE_MIGRATION_ADDRESS],
    queryFn: async () => {
      if (!TANGLE_MIGRATION_ADDRESS) return null;
      const result = await publicClient.readContract({
        address: TANGLE_MIGRATION_ADDRESS,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'merkleRoot',
      });
      return result as Hex;
    },
    enabled: !!TANGLE_MIGRATION_ADDRESS,
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

  // Dev mode - use mock data when contract not configured
  const isDevMode = !TANGLE_MIGRATION_ADDRESS;

  // Build eligibility object
  const eligibility = useMemo((): ClaimEligibility => {
    const actualClaimedAmount = claimedAmount ?? BigInt(0);
    const hasClaimed = actualClaimedAmount > BigInt(0);

    // In dev mode without proofs, provide mock eligibility for UI testing
    if (isDevMode && !claimData && ss58Address) {
      const mockAmount = BigInt('1000000000000000000000'); // 1000 TNT
      return {
        isEligible: true,
        amount: mockAmount,
        merkleProof: ['0x' + '00'.repeat(32)] as Hex[],
        pubkey: ('0x' + '11'.repeat(32)) as Hex,
        hasClaimed: false,
        claimedAmount: BigInt(0),
        timeRemaining: BigInt(365 * 24 * 60 * 60), // 1 year
        formattedBalance: '1,000',
        isPaused: false,
      };
    }

    if (!claimData) {
      return {
        isEligible: false,
        amount: null,
        merkleProof: null,
        pubkey: null,
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
      pubkey: claimData.pubkey,
      hasClaimed,
      claimedAmount: actualClaimedAmount,
      timeRemaining,
      formattedBalance,
      isPaused: isPaused ?? false,
    };
  }, [
    claimData,
    claimedAmount,
    timeRemaining,
    isPaused,
    isDevMode,
    ss58Address,
  ]);

  // In dev mode, don't wait for contract reads since they're disabled anyway
  const isLoading = isDevMode
    ? false
    : isLoadingProofs ||
      isLoadingClaimed ||
      isLoadingDeadline ||
      isLoadingPaused;

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
