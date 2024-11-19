/**
 * TODO:
 * - Asset ID should has a better type than string.
 * - Vault ID should has a better type than string.
 * - Account ID should has a better type than string.
 * - Amount should has a better type than string.
 *
 * Maybe we can utize the `Brand` type in `apps/tangle-dapp/types/utils.ts`
 * with some casting and assertion functions.
 */

import type {
  PalletAssetsAccountStatus,
  PalletAssetsAssetStatus,
  PalletAssetsExistenceReason,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
} from '@polkadot/types/lookup';
import { TransformEnum } from '@webb-tools/tangle-shared-ui/types/utils';

export type RewardVaultMap = {
  [vaultId: string]: string[] | null;
};

/**
 * Metadata of an asset, including ID, name, symbol, denomination, and status.
 */
export type AssetMetadata = {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;

  /**
   * The status of the asset.
   *
   * @field Live - The asset is live and can be staked.
   * @field Frozen - The asset is frozen and cannot be staked.
   * @field Destroying - The asset is being destroyed and cannot be staked.
   */
  readonly status: TransformEnum<PalletAssetsAssetStatus>;

  readonly vaultId: string | null;

  readonly priceInUsd: number | null;
};

/**
 * A map of asset metadata keyed by the asset's ID.
 */
export type AssetMap = {
  readonly [assetId: string]: AssetMetadata;
};

export type DelegatorWithdrawRequest = {
  readonly assetId: string;
  readonly amount: bigint;
  readonly requestedRound: number;
};

export type DelegatorUnstakeRequest = {
  readonly operatorAccountId: string;
  readonly assetId: string;
  readonly amount: bigint;
  readonly requestedRound: number;
};

export type DelegatorBondInfo = {
  readonly operatorAccountId: string;
  readonly amountBonded: bigint;
  readonly assetId: string;
};

/**
 * The status of a delegator.
 * @name PalletMultiAssetDelegationDelegatorDelegatorStatus (752)
 *
 * @field Active - The delegator is active.
 * @field { readonly LeavingScheduled: number } - The delegator has scheduled an exit to revoke all ongoing delegations.
 */
export type DelegatorStatus =
  TransformEnum<PalletMultiAssetDelegationDelegatorDelegatorStatus>;

/**
 * Info of a delegator, including deposits, delegations, and requests.
 * @name PalletMultiAssetDelegationDelegatorDelegatorMetadata (742)
 */
export type DelegatorInfo = {
  readonly deposits: {
    readonly [assetId: string]: {
      amount: bigint;
    };
  };

  readonly withdrawRequests: Array<DelegatorWithdrawRequest>;

  readonly delegations: Array<DelegatorBondInfo>;

  readonly unstakeRequests: Array<DelegatorUnstakeRequest>;

  readonly status: DelegatorStatus;
};

/**
 * The reason for the existence of an asset account.
 *
 * @field "Consumer"
 * @field "Sufficient"
 * @field "DepositRefunded"
 * @field "DepositBurned"
 * @field { DepositHeld: string; }
 * @field { DepositFrom: ITuple<[AccountId32, u128]>; }
 */
export type AssetAccountExistenceReason =
  TransformEnum<PalletAssetsExistenceReason>;

/**
 * The account balance of an asset and its status.
 * @name PalletAssetsAssetAccount
 */
export type AssetBalance = {
  readonly assetId: string;
  readonly balance: bigint;

  /**
   * The status of the account.
   *
   * @field "Frozen"
   * @field "Liquid"
   * @field "Blocked"
   */
  readonly status: TransformEnum<PalletAssetsAccountStatus>;

  readonly existenceReason: AssetAccountExistenceReason;
};

export type AssetBalanceMap = {
  readonly [assetId: string]: AssetBalance;
};

export type AssetWithBalance = {
  assetId: string;
  metadata: AssetMetadata;
  balance: AssetBalance | null;
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
  operatorAccountId: string;
  assetId: string;
};

export type UnstakeFormFields = DelegationFormFields;

export type WithdrawFormFields = {
  amount: string;
  assetId: string;
};
