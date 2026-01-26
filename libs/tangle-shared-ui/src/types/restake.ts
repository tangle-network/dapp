import type { Address } from 'viem';

// EVM-compatible restake types

/**
 * The activity status of the operator.
 */
export type OperatorStatus = 'ACTIVE' | 'INACTIVE' | 'LEAVING';

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
  readonly bondLessRequest: OperatorBondLessRequest | null;
  readonly delegations: Array<OperatorDelegatorBond>;
  readonly status: OperatorStatus;
  readonly restakersCount: number;
};

export type OperatorMap = Map<Address, OperatorMetadata>;

export type PrimitiveAssetMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  deposit?: string;
  isFrozen?: boolean;
};

export type RestakeAssetMetadata = PrimitiveAssetMetadata &
  Readonly<{
    assetId: string;
    vaultId: number | null;
    priceInUsd: number | null;
    status?: 'Live' | 'Frozen' | 'Destroying';
  }>;

export type DelegatorWithdrawRequest = {
  readonly assetId: string;
  readonly amount: bigint;
  readonly requestedRound: number;
};

export type DelegatorBondInfo = {
  readonly operatorAccountId: Address;
  readonly amountBonded: bigint;
  readonly assetId: string;
  readonly isNomination: boolean;
};

export type DelegatorUnstakeRequest = {
  readonly operatorAccountId: Address;
  readonly assetId: string;
  readonly amount: bigint;
  readonly requestedRound: number;
  readonly isNomination: boolean;
};

/**
 * The status of a delegator.
 */
export type DelegatorStatus = 'Active' | 'LeavingScheduled';

export type DelegatorInfo = {
  readonly deposits: {
    readonly [assetId: string]: {
      amount: bigint;
      delegatedAmount: bigint;
    };
  };
  readonly withdrawRequests: Array<DelegatorWithdrawRequest>;
  readonly delegations: Array<DelegatorBondInfo>;
  readonly unstakeRequests: Array<DelegatorUnstakeRequest>;
  readonly status: DelegatorStatus;
};

export type AssetBalanceMap = Map<string, bigint>;

export type RestakeAsset = {
  id: string;
  metadata: RestakeAssetMetadata;
  balance?: bigint;
};

export type RestakeAssetMap = Map<string, RestakeAsset>;

export type RestakeAssetTableItem = {
  id: string;
  name?: string;
  symbol: string;
  balance: bigint;
  decimals: number;
  label?: string;
  labelColor?: 'green' | 'purple' | 'blue' | 'red' | 'yellow';
};

/**
 * Operator display data for tables
 */
export type RestakeOperator = {
  address: string;
  identityName?: string;
  concentrationPercentage: number | null;
  restakersCount: number;
  selfBondedAmount: bigint;
  tvlInUsd: number | null;
  vaultTokens: Array<{
    name?: string;
    symbol: string;
    amount: bigint;
    decimals: number;
  }>;
  isDelegated: boolean;
  instanceCount: number;
  /** Delegation mode: 0=Disabled, 1=Whitelist, 2=Open. Null/undefined treated as 0 (Disabled). */
  delegationMode?: number | null;
  /** Whether the current user can delegate to this operator */
  canDelegate?: boolean;
};

/**
 * Vault for displaying restake assets
 */
export type RestakeVault = {
  id: number;
  name: string;
  representAssetSymbol: string;
  logo?: string;
  decimals: number;
  capacity?: bigint;
  assetMetadata: RestakeAssetMetadata[];
  totalDeposits?: bigint;
  totalDelegated?: bigint;
  tvl?: bigint;
  isNativeToken?: boolean;
};
