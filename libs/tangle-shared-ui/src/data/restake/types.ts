/**
 * Shared types for restake data hooks.
 * This file exists to break circular dependencies between graphql/useRestakeAssets
 * and restake/useOnChainRestakeAssets.
 */

import { Address } from 'viem';

// Token metadata from ERC20
export interface TokenMetadata {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

// Restaking asset from indexer
export interface RestakingAsset {
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

// Combined restake asset with metadata and balance
export interface RestakeAsset {
  id: Address; // Token address (EVM format)
  metadata: TokenMetadata;
  balance: bigint; // User's wallet balance
  restakingInfo: RestakingAsset; // On-chain restaking config from indexer
}

// Map of assets keyed by token address
export type RestakeAssetMap = Map<Address, RestakeAsset>;
