import type { WebbProviderType } from '@tangle-network/abstract-api-provider/types';
import { EvmAddress } from '@tangle-network/ui-components/types/address';

import { Address } from 'viem';

export type TangleTokenSymbol = 'tTNT' | 'TNT';

export type AddressWithIdentity = {
  address: Address | null;
  identity: string | null;
};

export type Payout = {
  eras: number[];
  validator: AddressWithIdentity;
  totalReward: bigint;
  totalRewardFormatted: string;
};

export const ExplorerType = {
  Substrate: 'polkadot' as WebbProviderType,
  EVM: 'web3' as WebbProviderType,
  Solana: 'solana' as WebbProviderType,
} as const;

export type BasicAccountInfo = {
  address: Address;
  identityName?: string;
};

export interface Validator extends BasicAccountInfo {
  isActive: boolean;
  commission: bigint;
  selfStakeAmount: bigint;
  totalStakeAmount: bigint;
  nominatorCount: number;
}

export type VaultToken = {
  name?: string;
  symbol: string;
  amount: bigint;
  decimals: number;
};

export type StakingOperator = {
  address: string;
  identityName?: string;
  selfBondedAmount: bigint;
  stakersCount?: number;
  concentrationPercentage: number | null;
  tvlInUsd: number | null;
  instanceCount?: number;
  isDelegated?: boolean;
  vaultTokens: VaultToken[];
  blueprintCount?: number;
  /** Delegation mode: 0=Disabled, 1=Whitelist, 2=Open. Null/undefined treated as 0 (Disabled). */
  delegationMode?: number | null;
  /** Whether the current user can delegate to this operator */
  canDelegate?: boolean;
};

export type StakingAssetId = string | EvmAddress;

export type TangleAssetId = { Custom: bigint } | { Erc20: EvmAddress };

export interface GraphQLPagination {
  first: number;
  offset: number;
}

export type BaseTxName = string;

export type GetSuccessMessageFn<Context> = (context: Context) => string;

/**
 * Transaction states for payout processing
 */
export enum PayoutTxState {
  /**
   * Transaction is not active
   */
  IDLE = 'idle',
  /**
   * Transaction is being executed
   */
  PROCESSING = 'processing',
  /**
   * Waiting for confirmation
   */
  WAITING = 'waiting',
  /**
   * Current chunk succeeded
   */
  SUCCESS = 'success',
  /**
   * Transaction error
   */
  ERROR = 'error',
  /**
   * All chunks completed
   */
  COMPLETED = 'completed',
}
