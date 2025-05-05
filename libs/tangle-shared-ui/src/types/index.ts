import type { BN } from '@polkadot/util';
import type { WebbProviderType } from '@tangle-network/abstract-api-provider/types';
import {
  EvmAddress,
  SolanaAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';

import { u128 } from '@polkadot/types';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
} from '@tangle-network/evm-contract-metadata';
import { Decimal } from 'decimal.js';
import { Abi } from 'viem';

export type TangleTokenSymbol = 'tTNT' | 'TNT';

export type AddressWithIdentity = {
  address: SubstrateAddress | null;
  identity: string | null;
};

export type Payout = {
  eras: number[];
  validator: AddressWithIdentity;
  totalReward: BN;
  totalRewardFormatted: string;
};

export const ExplorerType = {
  Substrate: 'polkadot' as WebbProviderType,
  EVM: 'web3' as WebbProviderType,
  Solana: 'solana' as WebbProviderType,
} as const;

export type BasicAccountInfo = {
  address: SubstrateAddress;
  identityName?: string;
};

export interface Validator extends BasicAccountInfo {
  isActive: boolean;
  commission: BN;
  selfStakeAmount: BN;
  totalStakeAmount: BN;
  nominatorCount: number;
}

export type VaultToken = {
  name?: string;
  symbol: string;
  amount: Decimal;
};

export type RestakeOperator = {
  address: SubstrateAddress;
  identityName?: string;
  selfBondedAmount: bigint;
  restakersCount: number;
  concentrationPercentage: number | null;
  tvlInUsd: number | null;
  isDelegated?: boolean;
  vaultTokens: VaultToken[];
  blueprintCount?: number;
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

export type RestakeAssetId = `${bigint}` | EvmAddress;

export type TangleAssetId = { Custom: u128 } | { Erc20: EvmAddress };

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
