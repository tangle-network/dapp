/**
 * TODO:
 * - Vault ID should has a better type than string.
 * - Amount should has a better type than string.
 */

import type { Address } from 'viem';
import type { LockDuration } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';

export type RewardVaultMap = {
  [vaultId: string]: string[] | null;
};

/**
 * Configuration for rewards associated with a specific asset.
 */
export type RewardConfigForAsset = {
  /**
   * The annual percentage yield (APY) for the asset, represented as a fixed point number.
   */
  readonly apy: number;

  /**
   * The minimum amount required before the asset can be rewarded.
   */
  readonly cap: bigint;
};

/**
 * Configuration for rewards in the system.
 */
export type RewardConfig = {
  /**
   * A map of asset IDs to their respective reward configurations.
   */
  configs: {
    [vaultId: string]: RewardConfigForAsset;
  };

  /**
   * A list of blueprint IDs that are whitelisted for rewards.
   */
  whitelistedBlueprintIds: number[];
};

// EVM form types using EVM addresses

export type EvmDepositFormFields = {
  amount: string;
  sourceTypedChainId: number;
  depositAssetId: Address;
  lockDuration: LockDuration;
};

export type EvmDelegationFormFields = {
  amount: string;
  operatorAddress: Address;
  assetId: Address;
};

export type EvmUnstakeFormFields = EvmDelegationFormFields;

export type EvmWithdrawFormFields = {
  amount: string;
  assetId: Address;
};
