/**
 * TODO:
 * - Asset ID should has a better type than string.
 * - Vault ID should has a better type than string.
 * - Amount should has a better type than string.
 *
 * Maybe we can utilize the `Brand` type in `apps/tangle-dapp/types/utils.ts`
 * with some casting and assertion functions.
 */

import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

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

export type DepositFormFields = {
  amount: string;
  sourceTypedChainId: number;
  depositAssetId: string;
  operatorAccountId: string | undefined;
};

export type DelegationFormFields = {
  amount: string;
  operatorAccountId: SubstrateAddress;
  assetId: string;
};

export type UnstakeFormFields = DelegationFormFields;

export type WithdrawFormFields = {
  amount: string;
  assetId: string;
};
