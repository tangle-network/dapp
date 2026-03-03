/**
 * Shared types for staking data hooks.
 *
 * Protocol/indexer schema names are kept where required (for example:
 * `StakingAssetConfig` on the GraphQL side).
 */

import { Address } from 'viem';

export interface TokenMetadata {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

export interface StakingAssetConfig {
  id: string;
  token: Address;
  enabled: boolean;
  minOperatorStake: bigint;
  minDelegation: bigint;
  depositCap: bigint | null;
  currentDeposits: bigint;
  rewardMultiplierBps: number;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface StakingAsset {
  id: Address;
  metadata: TokenMetadata;
  balance: bigint | null;
  stakingInfo?: StakingAssetConfig;
}

export type StakingAssetMap = Map<Address, StakingAsset>;
export type StakingTokenMetadata = TokenMetadata;
export type ProtocolStakingAsset = StakingAssetConfig;
