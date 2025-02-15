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
  address: SubstrateAddress;
  identity: string;
};

export type Payout = {
  era: number;
  validator: AddressWithIdentity;
  validatorTotalStake: BN;
  nominators: AddressWithIdentity[];
  validatorTotalReward: BN;
  nominatorTotalReward: BN;
  nominatorTotalRewardRaw: BN;
};

export const ExplorerType = {
  Substrate: 'polkadot' as WebbProviderType,
  EVM: 'web3' as WebbProviderType,
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
  explorerUrl?: string;
  destinationTxHash?: string;
  destinationTxState?: BridgeTxState;
  destinationTxExplorerUrl?: string;
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
