import type { BN } from '@polkadot/util';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import type {
  StakingAssetId as BaseStakingAssetId,
  StakingOperator as BaseStakingOperator,
} from './index';

export type { StakingAssetId } from './index';
export type StakingOperator = BaseStakingOperator;

export interface PrimitiveAssetMetadata {
  name: string;
  symbol: string;
  decimals: number;
  deposit?: string;
  isFrozen?: boolean;
}

export type PrimitiveStakingAssetMetadata = PrimitiveAssetMetadata;

export interface StakingAssetMetadata extends PrimitiveAssetMetadata {
  assetId: BaseStakingAssetId;
  vaultId: number | null;
  priceInUsd: number | null;
  status?: string;
  details?: unknown;
}

export interface StakingAsset {
  id: BaseStakingAssetId;
  metadata: StakingAssetMetadata;
  balance?: BN | bigint | null;
}

export type StakingAssetMap = Map<BaseStakingAssetId, StakingAsset>;

export interface DelegatorBondInfo {
  amount: bigint;
  delegatedAmount: bigint;
}

export interface DelegatorUnstakeRequest {
  amount: bigint;
  assetId: BaseStakingAssetId;
  requestedRound: number;
  operatorAccountId: string;
  isNomination: boolean;
}

export interface DelegatorWithdrawRequest {
  amount: bigint;
  assetId: BaseStakingAssetId;
  requestedRound: number;
}

export interface OperatorDelegatorBond {
  amount: bigint;
  delegatorAccountId: string;
  assetId: BaseStakingAssetId;
}

export type DelegatorStatus = 'Active' | { LeavingScheduled: number };

export interface DelegatorInfo {
  deposits: Record<BaseStakingAssetId, DelegatorBondInfo>;
  delegations: Array<{
    assetId: BaseStakingAssetId;
    amountBonded: bigint;
    operatorAccountId: string;
    isNomination: boolean;
  }>;
  unstakeRequests: DelegatorUnstakeRequest[];
  withdrawRequests: DelegatorWithdrawRequest[];
  status: DelegatorStatus;
}

export type OperatorStatus = 'Active' | 'Inactive' | { Leaving: number };

export interface OperatorMetadata {
  stake: bigint;
  delegationCount: number;
  bondLessRequest: {
    amount: bigint;
    requestTime: number;
  } | null;
  delegations: OperatorDelegatorBond[];
  stakersCount: number;
  status: OperatorStatus;
}

export type OperatorMap = Map<SubstrateAddress, OperatorMetadata>;

export interface StakingVault {
  id: number;
  name: string;
  representAssetSymbol: string;
  logo?: string;
  decimals: number;
  capacity?: BN;
  assetMetadata: StakingAssetMetadata[];
  totalDeposits?: BN;
  totalDelegated?: BN;
  tvl?: BN;
  isNativeToken?: boolean;
}

export type StakingAssetTableItem = StakingAsset;

export type StakingDelegatorInfo = DelegatorInfo;
export type StakingDelegatorBondInfo = DelegatorBondInfo;
export type StakingDelegatorUnstakeRequest = DelegatorUnstakeRequest;
export type StakingDelegatorWithdrawRequest = DelegatorWithdrawRequest;
export type StakingOperatorDelegatorBond = OperatorDelegatorBond;
export type StakingOperatorMetadata = OperatorMetadata;
export type StakingOperatorMap = OperatorMap;
export type StakingOperatorStatus = OperatorStatus;
