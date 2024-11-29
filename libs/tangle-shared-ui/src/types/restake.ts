import {
  PalletAssetsAssetStatus,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
  PalletMultiAssetDelegationOperatorOperatorStatus,
} from '@polkadot/types/lookup';
import { TransformEnum } from './utils';

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

export type OperatorDelegatorBond = {
  readonly delegatorAccountId: string;
  readonly amount: bigint;
  readonly assetId: string;
};

export type OperatorBondLessRequest = {
  readonly amount: bigint;
  readonly requestTime: number;
};

export type OperatorMetadata = {
  readonly stake: bigint;
  readonly delegationCount: number;

  /**
   * Optional request to decrease the operator's self-bond.
   * Only one allowed at a time.
   */
  readonly bondLessRequest: OperatorBondLessRequest | null;
  readonly delegations: Array<OperatorDelegatorBond>;
  readonly status: OperatorStatus;
  readonly restakersCount: number;
};

export type OperatorMap = {
  readonly [accountId: string]: OperatorMetadata;
};

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

export type AssetMap = {
  readonly [assetId: string]: AssetMetadata;
};

export type DelegatorWithdrawRequest = {
  readonly assetId: string;
  readonly amount: bigint;
  readonly requestedRound: number;
};

export type DelegatorBondInfo = {
  readonly operatorAccountId: string;
  readonly amountBonded: bigint;
  readonly assetId: string;
};

export type DelegatorUnstakeRequest = {
  readonly operatorAccountId: string;
  readonly assetId: string;
  readonly amount: bigint;
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
