import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  type Hex,
  formatUnits,
  keccak256,
  encodeAbiParameters,
  createPublicClient,
  http,
  zeroAddress,
} from 'viem';
import { useChainId } from 'wagmi';
import { getMigrationContractsByChainId } from '@tangle-network/dapp-config/contracts';
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
const MIGRATION_RPC_URL = import.meta.env.VITE_MIGRATION_RPC_URL as
  | string
  | undefined;
const getNowSeconds = () => BigInt(Math.floor(Date.now() / 1000));

// TangleMigration contract ABI (partial - only functions we use)
const TANGLE_MIGRATION_ABI = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_merkleRoot',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_zkVerifier',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'adminClaim',
    inputs: [
      {
        name: 'pubkey',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'merkleProof',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'adminClaimDeadline',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimDeadline',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimWithZKProof',
    inputs: [
      {
        name: 'pubkey',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'merkleProof',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
      {
        name: 'zkProof',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimed',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'emergencyWithdraw',
    inputs: [
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getClaimedAmount',
    inputs: [
      {
        name: 'pubkey',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lockFactory',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract TNTLockFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'merkleRoot',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'reduceAdminClaimDeadline',
    inputs: [
      {
        name: '_newDeadline',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setClaimDeadline',
    inputs: [
      {
        name: '_deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setLockConfig',
    inputs: [
      {
        name: '_lockFactory',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_unlockTimestamp',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '_unlockedBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMerkleRoot',
    inputs: [
      {
        name: '_merkleRoot',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPaused',
    inputs: [
      {
        name: '_paused',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setZKVerifier',
    inputs: [
      {
        name: '_zkVerifier',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'token',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalClaimed',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unlockTimestamp',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unlockedBps',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'verifyMerkleProof',
    inputs: [
      {
        name: 'pubkey',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'merkleProof',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    outputs: [
      {
        name: 'valid',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'zkVerifier',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IZKVerifier',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AdminClaimDeadlineUpdated',
    inputs: [
      {
        name: 'oldDeadline',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newDeadline',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AdminClaimed',
    inputs: [
      {
        name: 'pubkey',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ClaimDeadlineUpdated',
    inputs: [
      {
        name: 'oldDeadline',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newDeadline',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Claimed',
    inputs: [
      {
        name: 'pubkey',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'unlockedAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lockedAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lock',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EmergencyWithdraw',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LockConfigUpdated',
    inputs: [
      {
        name: 'lockFactory',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'unlockTimestamp',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
      {
        name: 'unlockedBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MerkleRootUpdated',
    inputs: [
      {
        name: 'oldRoot',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'newRoot',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [
      {
        name: 'isPaused',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ZKVerifierUpdated',
    inputs: [
      {
        name: 'oldVerifier',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newVerifier',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AdminClaimWindowClosed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyClaimed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ClaimDeadlinePassed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ClaimsPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmergencyWithdrawNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAdminClaimDeadline',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBps',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidMerkleProof',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidZKProof',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LockConfigLocked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoZKVerifier',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAmount',
    inputs: [],
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
const ENV_MIGRATION_ADDRESS =
  (import.meta.env.VITE_TANGLE_MIGRATION_ADDRESS as Hex) || null;

const isConfiguredAddress = (address?: Hex | null): address is Hex => {
  return !!address && address.toLowerCase() !== zeroAddress;
};

const normalizeError = (value: unknown): Error | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Error) {
    return value;
  }

  return new Error(String(value));
};

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
  /** Percentage unlocked immediately (basis points, 1000 = 10%) */
  unlockedBps: number;
  /** Timestamp when locked tokens become withdrawable */
  unlockTimestamp: bigint;
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
  const chainId = useChainId();
  const [nowSeconds, setNowSeconds] = useState(getNowSeconds);
  const migrationConfig = useMemo(() => {
    if (!chainId) return null;
    return getMigrationContractsByChainId(chainId);
  }, [chainId]);
  const migrationAddress = useMemo(() => {
    if (isConfiguredAddress(ENV_MIGRATION_ADDRESS)) {
      return ENV_MIGRATION_ADDRESS;
    }

    const chainMigrationAddress = migrationConfig?.migrationClaim ?? null;
    return isConfiguredAddress(chainMigrationAddress)
      ? chainMigrationAddress
      : null;
  }, [migrationConfig]);

  const rpcUrl = useMemo(() => {
    if (MIGRATION_RPC_URL) return MIGRATION_RPC_URL;
    if (chainId === 84532) return 'https://sepolia.base.org';
    return 'http://localhost:8545';
  }, [chainId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowSeconds(getNowSeconds());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  /**
   * Create a viem public client for direct contract reads.
   * This bypasses wagmi which has issues with chain routing.
   */
  const publicClient = useMemo(() => {
    return createPublicClient({
      transport: http(rpcUrl),
    });
  }, [rpcUrl]);

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
  } = useQuery<MigrationProofsData, Error>({
    queryKey: ['migration-proofs'],
    queryFn: async () => {
      const response = await fetch(PROOFS_URL);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch migration proofs data from ${PROOFS_URL} (${response.status})`,
        );
      }

      const json = await response.text();
      return loadMerkleTreeData(json);
    },
    staleTime: Infinity, // Proofs data is static
    gcTime: 24 * 60 * 60 * 1000, // Keep for 24 hours
    retry: 3,
  });

  // Check claimed amount on-chain using the pubkey (derived from SS58)
  // IMPORTANT: We use viem's publicClient directly because wagmi has routing issues
  // that cause it to return empty data even when the RPC works correctly.
  const {
    data: claimedAmount,
    isLoading: isLoadingClaimed,
    error: claimedAmountError,
  } = useQuery<bigint, Error>({
    queryKey: ['migration-claimed-amount', pubkeyFromSs58, migrationAddress],
    queryFn: async () => {
      if (!pubkeyFromSs58 || !migrationAddress) {
        return BigInt(0);
      }
      const result = await publicClient.readContract({
        address: migrationAddress,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'getClaimedAmount',
        args: [pubkeyFromSs58],
      });
      return result as bigint;
    },
    enabled: !!pubkeyFromSs58 && !!migrationAddress,
    // Always refetch on mount and window focus to ensure we have the latest claimed status
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    // Don't cache - always fetch fresh data for claim status
    staleTime: 0,
    gcTime: 0,
  });

  // Get claim deadline using viem directly
  const {
    data: claimDeadline,
    isLoading: isLoadingDeadline,
    error: claimDeadlineError,
  } = useQuery<bigint, Error>({
    queryKey: ['migration-claim-deadline', migrationAddress],
    queryFn: async () => {
      if (!migrationAddress) return BigInt(0);
      const result = await publicClient.readContract({
        address: migrationAddress,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'claimDeadline',
      });
      return result as bigint;
    },
    enabled: !!migrationAddress,
    refetchInterval: 60000, // Refresh every minute
  });

  // Check if paused using viem directly
  const {
    data: isPaused,
    isLoading: isLoadingPaused,
    error: isPausedError,
  } = useQuery<boolean, Error>({
    queryKey: ['migration-paused', migrationAddress],
    queryFn: async () => {
      if (!migrationAddress) return false;
      const result = await publicClient.readContract({
        address: migrationAddress,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'paused',
      });
      return result as boolean;
    },
    enabled: !!migrationAddress,
  });

  // Get unlock configuration (percentage unlocked immediately)
  const {
    data: unlockedBps,
    isLoading: isLoadingUnlockedBps,
    error: unlockedBpsError,
  } = useQuery<number, Error>({
    queryKey: ['migration-unlocked-bps', migrationAddress],
    queryFn: async () => {
      if (!migrationAddress) return 10000; // Default 100% if not configured
      const result = await publicClient.readContract({
        address: migrationAddress,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'unlockedBps',
      });
      return Number(result);
    },
    enabled: !!migrationAddress,
    staleTime: Infinity, // Lock config doesn't change after first claim
  });

  // Get unlock timestamp (when locked tokens become withdrawable)
  const {
    data: unlockTimestamp,
    isLoading: isLoadingUnlockTimestamp,
    error: unlockTimestampError,
  } = useQuery<bigint, Error>({
    queryKey: ['migration-unlock-timestamp', migrationAddress],
    queryFn: async () => {
      if (!migrationAddress) return BigInt(0);
      const result = await publicClient.readContract({
        address: migrationAddress,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'unlockTimestamp',
      });
      return result as bigint;
    },
    enabled: !!migrationAddress,
    staleTime: Infinity, // Lock config doesn't change after first claim
  });

  // Get merkle root for verification using viem directly
  const { data: merkleRoot, error: merkleRootError } = useQuery<
    Hex | null,
    Error
  >({
    queryKey: ['migration-merkle-root', migrationAddress],
    queryFn: async () => {
      if (!migrationAddress) return null;
      const result = await publicClient.readContract({
        address: migrationAddress,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'merkleRoot',
      });
      return result as Hex;
    },
    enabled: !!migrationAddress,
  });

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!claimDeadline) return BigInt(0);
    if (claimDeadline <= nowSeconds) return BigInt(0);
    return claimDeadline - nowSeconds;
  }, [claimDeadline, nowSeconds]);

  // Compute eligibility from proofs data
  const claimData = useMemo((): ClaimData | null => {
    if (!ss58Address || !proofsData) {
      return null;
    }
    return lookupClaim(proofsData, ss58Address);
  }, [ss58Address, proofsData]);

  // Dev mode - use mock data when contract not configured
  const isDevMode = !migrationAddress;

  const eligibilityError = useMemo(() => {
    return (
      normalizeError(proofsError) ??
      normalizeError(claimedAmountError) ??
      normalizeError(claimDeadlineError) ??
      normalizeError(isPausedError) ??
      normalizeError(unlockedBpsError) ??
      normalizeError(unlockTimestampError) ??
      normalizeError(merkleRootError)
    );
  }, [
    proofsError,
    claimedAmountError,
    claimDeadlineError,
    isPausedError,
    unlockedBpsError,
    unlockTimestampError,
    merkleRootError,
  ]);

  // Build eligibility object
  const eligibility = useMemo((): ClaimEligibility => {
    const actualClaimedAmount = claimedAmount ?? BigInt(0);
    const hasClaimed = actualClaimedAmount > BigInt(0);

    // Default lock config values
    const actualUnlockedBps = unlockedBps ?? 10000; // 100% if not set
    const actualUnlockTimestamp = unlockTimestamp ?? BigInt(0);

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
        unlockedBps: 1000, // Mock 10% unlocked for dev mode
        unlockTimestamp: nowSeconds + BigInt(180 * 24 * 60 * 60), // 180 days from now
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
        unlockedBps: actualUnlockedBps,
        unlockTimestamp: actualUnlockTimestamp,
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
      unlockedBps: actualUnlockedBps,
      unlockTimestamp: actualUnlockTimestamp,
    };
  }, [
    claimData,
    claimedAmount,
    timeRemaining,
    isPaused,
    isDevMode,
    ss58Address,
    unlockedBps,
    unlockTimestamp,
    nowSeconds,
  ]);

  // In dev mode, don't wait for contract reads since they're disabled anyway
  const isLoading = isDevMode
    ? false
    : isLoadingProofs ||
      isLoadingClaimed ||
      isLoadingDeadline ||
      isLoadingPaused ||
      isLoadingUnlockedBps ||
      isLoadingUnlockTimestamp;

  return {
    eligibility,
    isLoading,
    error: eligibilityError,
    merkleRoot: merkleRoot ?? null,
    contractAddress: migrationAddress,
    contractConfigured: !!migrationAddress,
  };
};

export default useClaimEligibility;
