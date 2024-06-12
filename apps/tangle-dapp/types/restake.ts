import type {
  PalletAssetsAssetStatus,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
  PalletMultiAssetDelegationOperatorOperatorStatus,
} from '@polkadot/types/lookup';

import { TransformEnum } from './utils';

/**
 * A request scheduled to change the operator self-bond.
 * @name PalletMultiAssetDelegationOperatorOperatorBondLessRequest (737)
 */
export type OperatorBondLessRequest = Readonly<{
  /**
   * The amount by which the bond is to be decreased.
   */
  amount: bigint;

  /**
   * The amount by which the bond is to be decreased, formatted as a string.
   */
  amountFormatted: string;

  /**
   * The round in which the request was made.
   */
  requestTime: number;
}>;

/**
 * Represents a bond for an operator from a delegator.
 * @name PalletMultiAssetDelegationOperatorDelegatorBond (739)
 */
export type OperatorDelegatorBond = Readonly<{
  /**
   * The account ID of the delegator.
   */
  delegator: string;

  /**
   * The amount bonded.
   */
  amount: bigint;

  /**
   * The amount bonded, formatted as a string.
   */
  amountFormatted: string;

  /**
   * The ID of the bonded asset.
   */
  assetId: bigint;
}>;

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
export type OperatorMetadata = Readonly<{
  /**
   * The operator's self-bond amount.
   */
  bond: bigint;

  /**
   * The operator's self-bond amount, formatted as a string.
   */
  bondFormatted: string;

  /**
   * The total number of delegations to this operator.
   */
  delegationCount: number;

  /**
   * An optional pending request to decrease the operator's self-bond,
   * with only one allowed at any given time.
   */
  request: OperatorBondLessRequest | null;

  /**
   * A list of all current delegations.
   */
  delegations: Array<OperatorDelegatorBond>;

  /**
   * The current status of the operator.
   */
  status: OperatorStatus;
}>;

/**
 * A map of operator metadata keyed by the operator's account ID.
 */
export type OperatorMap = Readonly<{
  [accountId: string]: OperatorMetadata;
}>;

/**
 * Metadata of an asset, including ID, name, symbol, denomination, and status.
 */
export type AssetMetadata = Readonly<{
  /**
   * The ID of the asset.
   */
  id: string;

  /**
   * The name of the asset.
   */
  name: string;

  /**
   * The symbol of the asset.
   */
  symbol: string;

  /**
   * The denomination of the asset.
   */
  decimals: number;

  /**
   * The status of the asset.
   *
   * @field Live - The asset is live and can be staked.
   * @field Frozen - The asset is frozen and cannot be staked.
   * @field Destroying - The asset is being destroyed and cannot be staked.
   */
  status: TransformEnum<PalletAssetsAssetStatus>;
}>;

/**
 * A map of asset metadata keyed by the asset's ID.
 */
export type AssetMap = Readonly<{
  [assetId: string]: AssetMetadata;
}>;

/**
 * Represents a request to unstake a specific amount of an asset.
 * @name PalletMultiAssetDelegationDelegatorUnstakeRequest (747)
 */
export type DelegatorUnstakeRequest = Readonly<{
  /**
   * The ID of the asset to be unstaked.
   */
  assetId: string;

  /**
   * The amount of the asset to be unstaked.
   */
  amount: bigint;

  /**
   * The amount of the asset to be unstaked, formatted as a string.
   */
  amountFormatted: string;

  /**
   * The round in which the unstake was requested.
   */
  requestedRound: number;
}>;

/**
 * Represents a bond between a delegator and an operator.
 * @name PalletMultiAssetDelegationDelegatorBondInfoDelegator (749)
 */
export type DelegatorBondInfo = Readonly<{
  /**
   * The account ID of the operator.
   */
  operator: string;

  /**
   * The amount bonded.
   */
  amount: bigint;

  /**
   * The amount bonded, formatted as a string.
   */
  amountFormatted: string;

  /**
   * The ID of the bonded asset.
   */
  assetId: string;
}>;

/**
 * Represents a request to reduce the bonded amount of a specific asset.
 * @name PalletMultiAssetDelegationDelegatorBondLessRequest (751)
 */
export type DelegatorBondLessRequest = Readonly<{
  /**
   * The ID of the asset to reduce the bond of.
   */
  assetId: string;

  /**
   * The amount by which to reduce the bond.
   */
  amount: bigint;

  /**
   * The amount by which to reduce the bond, formatted as a string.
   */
  amountFormatted: string;

  /**
   * The round in which the bond reduction was requested.
   */
  requestedRound: number;
}>;

/**
 * The status of a delegator.
 * @name PalletMultiAssetDelegationDelegatorDelegatorStatus (752)
 *
 * @field Active - The delegator is active.
 * @field { readonly LeavingScheduled: number } - The delegator has scheduled an exit to revoke all ongoing delegations.
 */
type DelegatorStatus =
  TransformEnum<PalletMultiAssetDelegationDelegatorDelegatorStatus>;

/**
 * Info of a delegator, including deposits, delegations, and requests.
 * @name PalletMultiAssetDelegationDelegatorDelegatorMetadata (742)
 */
export type DelegatorInfo = Readonly<{
  /**
   * A map of deposited assets and their respective amounts.
   */
  deposits: Readonly<{
    [assetId: string]: {
      amount: bigint;
      amountFormatted: string;
    };
  }>;

  /**
   * An optional unstake request, with only one allowed at a time.
   */
  unstakeRequest: DelegatorUnstakeRequest | null;

  /**
   * A list of all current delegations.
   */
  delegations: Array<DelegatorBondInfo>;

  /**
   * An optional request to reduce the bonded amount, with only one allowed at a time.
   */
  delegatorBondLessRequest: DelegatorBondLessRequest | null;

  /**
   * The current status of the delegator.
   */
  status: DelegatorStatus;
}>;
