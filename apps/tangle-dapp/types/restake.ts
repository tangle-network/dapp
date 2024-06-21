import type {
  PalletAssetsAccountStatus,
  PalletAssetsAssetStatus,
  PalletAssetsExistenceReason,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
  PalletMultiAssetDelegationOperatorOperatorStatus,
} from '@polkadot/types/lookup';

import { TransformEnum } from './utils';

/**
 * A request scheduled to change the operator self-bond.
 * @name PalletMultiAssetDelegationOperatorOperatorBondLessRequest (737)
 */
export type OperatorBondLessRequest = {
  /**
   * The amount by which the bond is to be decreased.
   */
  readonly amount: bigint;

  /**
   * The round in which the request was made.
   */
  readonly requestTime: number;
};

/**
 * Represents a bond for an operator from a delegator.
 * @name PalletMultiAssetDelegationOperatorDelegatorBond (739)
 */
export type OperatorDelegatorBond = {
  /**
   * The account ID of the delegator.
   */
  readonly delegator: string;

  /**
   * The amount bonded.
   */
  readonly amount: bigint;

  /**
   * The ID of the bonded asset.
   */
  readonly assetId: string;
};

/**
 * The activity status of the operator.
 * @name PalletMultiAssetDelegationOperatorOperatorStatus (740)
 *
 * @field Active - Committed to be online.
 * @field Inactive - Temporarily inactive and excused for inactivity.
 * @field { Leaving: number } - Bonded until the specified round.
 */
export type OperatorStatus =
  TransformEnum<PalletMultiAssetDelegationOperatorOperatorStatus>;

/**
 * Metadata of an operator, including bond, delegations, and status.
 * @name PalletMultiAssetDelegationOperatorOperatorMetadata (735)
 */
export type OperatorMetadata = {
  /**
   * The operator's self-bond amount.
   */
  readonly bond: bigint;

  /**
   * The total number of delegations to this operator.
   */
  readonly delegationCount: number;

  /**
   * An optional pending request to decrease the operator's self-bond,
   * with only one allowed at any given time.
   */
  readonly request: OperatorBondLessRequest | null;

  /**
   * A list of all current delegations.
   */
  readonly delegations: Array<OperatorDelegatorBond>;

  /**
   * The current status of the operator.
   */
  readonly status: OperatorStatus;
};

/**
 * A map of operator metadata keyed by the operator's account ID.
 */
export type OperatorMap = {
  readonly [accountId: string]: OperatorMetadata;
};

/**
 * Metadata of an asset, including ID, name, symbol, denomination, and status.
 */
export type AssetMetadata = {
  /**
   * The ID of the asset.
   */
  readonly id: string;

  /**
   * The name of the asset.
   */
  readonly name: string;

  /**
   * The symbol of the asset.
   */
  readonly symbol: string;

  /**
   * The denomination of the asset.
   */
  readonly decimals: number;

  /**
   * The status of the asset.
   *
   * @field Live - The asset is live and can be staked.
   * @field Frozen - The asset is frozen and cannot be staked.
   * @field Destroying - The asset is being destroyed and cannot be staked.
   */
  readonly status: TransformEnum<PalletAssetsAssetStatus>;
};

/**
 * A map of asset metadata keyed by the asset's ID.
 */
export type AssetMap = {
  readonly [assetId: string]: AssetMetadata;
};

/**
 * Represents a request to unstake a specific amount of an asset.
 * @name PalletMultiAssetDelegationDelegatorUnstakeRequest (747)
 */
export type DelegatorUnstakeRequest = {
  /**
   * The ID of the asset to be unstaked.
   */
  readonly assetId: string;

  /**
   * The amount of the asset to be unstaked.
   */
  readonly amount: bigint;

  /**
   * The round in which the unstake was requested.
   */
  readonly requestedRound: number;
};

/**
 * Represents a bond between a delegator and an operator.
 * @name PalletMultiAssetDelegationDelegatorBondInfoDelegator (749)
 */
export type DelegatorBondInfo = {
  /**
   * The account ID of the operator.
   */
  readonly operator: string;

  /**
   * The amount bonded.
   */
  readonly amount: bigint;

  /**
   * The ID of the bonded asset.
   */
  readonly assetId: string;
};

/**
 * Represents a request to reduce the bonded amount of a specific asset.
 * @name PalletMultiAssetDelegationDelegatorBondLessRequest (751)
 */
export type DelegatorBondLessRequest = {
  /**
   * The ID of the asset to reduce the bond of.
   */
  readonly assetId: string;

  /**
   * The amount by which to reduce the bond.
   */
  readonly amount: bigint;

  /**
   * The round in which the bond reduction was requested.
   */
  readonly requestedRound: number;
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
  /**
   * A map of deposited assets and their respective amounts.
   */
  readonly deposits: {
    readonly [assetId: string]: {
      amount: bigint;
    };
  };

  /**
   * An optional unstake request, with only one allowed at a time.
   */
  readonly unstakeRequest: DelegatorUnstakeRequest | null;

  /**
   * A list of all current delegations.
   */
  readonly delegations: Array<DelegatorBondInfo>;

  /**
   * An optional request to reduce the bonded amount, with only one allowed at a time.
   */
  readonly delegatorBondLessRequest: DelegatorBondLessRequest | null;

  /**
   * The current status of the delegator.
   */
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
  /**
   * The ID of the asset.
   */
  readonly assetId: string;

  /**
   * The balance of the asset.
   */
  readonly balance: bigint;

  /**
   * The status of the account.
   *
   * @field "Frozen"
   * @field "Liquid"
   * @field "Blocked"
   */
  readonly status: TransformEnum<PalletAssetsAccountStatus>;

  /**
   * The reason for the existence of the account.
   */
  readonly reason: AssetAccountExistenceReason;
};

export type AssetBalanceMap = {
  readonly [assetId: string]: AssetBalance;
};

export type DepositFormFields = {
  amount: string;
};
