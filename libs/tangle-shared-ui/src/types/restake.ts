import {
  PalletAssetsAccountStatus,
  PalletAssetsAssetDetails,
  PalletAssetsAssetStatus,
  PalletAssetsExistenceReason,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
  PalletMultiAssetDelegationOperatorOperatorStatus,
} from '@polkadot/types/lookup';
import { TransformEnum } from './utils';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { RestakeAssetId } from '../utils/createRestakeAssetId';

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
  readonly [accountId: SubstrateAddress]: OperatorMetadata;
};

export type RestakeVaultAssetMetadata = Readonly<{
  id: RestakeAssetId;
  name: string;
  symbol: string;
  decimals: number;
  vaultId: number | null;
  priceInUsd: number | null;
  details?: PalletAssetsAssetDetails;

  /**
   * The status of the asset.
   *
   * @field Live - The asset is live and can be staked.
   * @field Frozen - The asset is frozen and cannot be staked.
   * @field Destroying - The asset is being destroyed and cannot be staked.
   */
  status: TransformEnum<PalletAssetsAssetStatus>;
}>;

export type RestakeVaultAssetMap = {
  readonly [assetId: string]: RestakeVaultAssetMetadata;
};

export type DelegatorWithdrawRequest = {
  readonly assetId: RestakeAssetId;
  readonly amount: bigint;
  readonly requestedRound: number;
};

export type DelegatorBondInfo = {
  readonly operatorAccountId: SubstrateAddress;
  readonly amountBonded: bigint;
  readonly assetId: RestakeAssetId;
};

export type DelegatorUnstakeRequest = {
  readonly operatorAccountId: SubstrateAddress;
  readonly assetId: RestakeAssetId;
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
    readonly [assetId: RestakeAssetId]: {
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
  metadata: RestakeVaultAssetMetadata;
  balance: AssetBalance | null;
};
