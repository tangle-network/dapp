import type { Address } from 'viem';

export enum ValidatorStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  WITHDRAWN = 2,
}

export interface ValidatorInfo {
  validatorIndex: number;
  restakedBalanceGwei: bigint;
  lastCheckpointedAt: bigint;
  status: ValidatorStatus;
  pubkeyHash: `0x${string}`;
}

export interface Checkpoint {
  beaconBlockRoot: `0x${string}`;
  proofsRemaining: number;
  podBalanceGwei: bigint;
  balanceDeltasGwei: bigint;
  priorBeaconBalanceGwei: bigint;
}

export interface PodInfo {
  address: Address;
  owner: Address;
  hasRestaked: boolean;
  activeValidatorCount: number;
  totalRestakedBalanceGwei: bigint;
  beaconChainSlashingFactor: bigint;
  proofSubmitter: Address | null;
  withdrawalCredentials: `0x${string}`;
  currentCheckpointTimestamp: bigint;
  lastCompletedCheckpointTimestamp: bigint;
  checkpointActive: boolean;
  currentCheckpoint: Checkpoint | null;
}

export interface PodOwnerInfo {
  hasPod: boolean;
  podAddress: Address | null;
  shares: bigint;
  totalDelegated: bigint;
  queuedShares: bigint;
  availableToWithdraw: bigint;
}

export interface OperatorInfo {
  address: Address;
  isOperator: boolean;
  isActive: boolean;
  selfStake: bigint;
  delegatedStake: bigint;
  totalStake: bigint;
}

export interface Withdrawal {
  withdrawalRoot: `0x${string}`;
  staker: Address;
  shares: bigint;
  startBlock: number;
  completed: boolean;
  canComplete: boolean;
}

export interface DelegationInfo {
  operator: Address;
  amount: bigint;
}

// Proof types for CLI uploads
export interface StateRootProof {
  beaconStateRoot: `0x${string}`;
  proof: `0x${string}`;
}

export interface BalanceContainerProof {
  balanceContainerRoot: `0x${string}`;
  proof: `0x${string}`;
}

export interface BalanceProof {
  pubkeyHash: `0x${string}`;
  balanceRoot: `0x${string}`;
  proof: `0x${string}`;
}

export interface ValidatorFieldsProof {
  validatorFields: `0x${string}`[];
  proof: `0x${string}`;
}

export interface CredentialProofBundle {
  beaconTimestamp: bigint;
  stateRootProof: StateRootProof;
  validatorIndices: number[];
  validatorFieldsProofs: `0x${string}`[];
  validatorFields: `0x${string}`[][];
}

export interface CheckpointProofBundle {
  stateRootProof: StateRootProof;
  balanceContainerProof: BalanceContainerProof;
  proofs: BalanceProof[];
}

export interface StaleBalanceProofBundle {
  beaconTimestamp: bigint;
  stateRootProof: StateRootProof;
  validatorProof: ValidatorFieldsProof;
}

// Native Restaking Tab types
export enum NativeRestakeTab {
  OVERVIEW = 'overview',
  VALIDATORS = 'validators',
  CHECKPOINT = 'checkpoint',
  DELEGATE = 'delegate',
  WITHDRAW = 'withdraw',
}

// Constants
export const GWEI_TO_WEI = BigInt(1_000_000_000);
export const MAX_EFFECTIVE_BALANCE_GWEI = BigInt(32_000_000_000); // 32 ETH in gwei
export const INITIAL_SLASHING_FACTOR = BigInt('1000000000000000000'); // 1e18
export const MAX_BEACON_ROOT_AGE_SECONDS = 27 * 60 * 60; // 27 hours

// Helper to convert gwei to ETH string
export const gweiToEth = (gwei: bigint): string => {
  const eth = Number(gwei) / 1_000_000_000;
  return eth.toFixed(4);
};

// Helper to convert wei to ETH string
export const weiToEth = (wei: bigint): string => {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
};

// Helper to check if slashing factor is degraded
export const isSlashingFactorDegraded = (factor: bigint): boolean => {
  return factor < INITIAL_SLASHING_FACTOR;
};

// Helper to calculate slashing percentage
export const getSlashingPercentage = (factor: bigint): number => {
  if (factor >= INITIAL_SLASHING_FACTOR) return 0;
  const degradation = INITIAL_SLASHING_FACTOR - factor;
  return (Number(degradation) / Number(INITIAL_SLASHING_FACTOR)) * 100;
};
