import type { WebbProviderType } from '@tangle-network/abstract-api-provider/types';
import {
  EvmAddress,
  SolanaAddress,
} from '@tangle-network/ui-components/types/address';

import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { Decimal } from 'decimal.js';
import { Abi, Address } from 'viem';
import { EVMTokenBridgeEnum, EVMTokenEnum } from './bridge-metadata';

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

// Bridge
export enum BridgeTxState {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
}

export type BridgeQueueTxItem = {
  hash: string;
  env: 'live' | 'test' | 'dev';
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  sourceAddress: string;
  recipientAddress: string;
  sourceAmount: string;
  destinationAmount: string;
  tokenSymbol: string;
  creationTimestamp: number;
  state: BridgeTxState;
  explorerUrl?: string | null;
  destinationTxHash?: string;
  destinationTxState?: BridgeTxState;
  destinationTxExplorerUrl?: string | null;
  bridgeType: EVMTokenBridgeEnum;
};

export type BridgeToken = {
  name?: string;
  symbol: string;
  tokenType: EVMTokenEnum;
  bridgeType: EVMTokenBridgeEnum;
  address: EvmAddress | SolanaAddress;
  abi: Abi;
  decimals: number;
  chainId: PresetTypedChainId;
  hyperlaneSyntheticAddress?: EvmAddress;
  isTestnet?: boolean;
};

export type BridgeChainsConfigType = Record<
  PresetTypedChainId,
  Record<
    PresetTypedChainId,
    {
      supportedTokens: BridgeToken[];
    }
  >
>;

export type BridgeTokenWithBalance = BridgeToken & {
  balance: Decimal;
  syntheticBalance?: Decimal;
};

export type BridgeChainBalances = Partial<
  Record<PresetTypedChainId, BridgeTokenWithBalance[]>
>;

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
