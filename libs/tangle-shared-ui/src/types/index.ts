import type { BN } from '@polkadot/util';
import type { WebbProviderType } from '@webb-tools/abstract-api-provider/types';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
} from '@webb-tools/evm-contract-metadata';
import { Abi } from 'viem';
import { Decimal } from 'decimal.js';

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
  address: string;
  identityName: string;
};

export interface Nominee extends BasicAccountInfo {
  isActive: boolean;
  commission: BN;
  selfStakeAmount: BN;
  totalStakeAmount: BN;
  nominatorCount: number;
}

export type VaultToken = {
  name: string;
  symbol: string;
  amount: number | string;
};

export type OperatorData = {
  address: string;
  identityName: string;
  restakersCount: number;
  concentrationPercentage: number | null;
  tvlInUsd: number | null;
  vaultTokens: VaultToken[];
};
// Bridge

export enum BridgeTxState {
  Initializing = 'Initializing',
  Sending = 'Sending',
  Executed = 'Executed',
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

export interface BridgeTokenType {
  tokenSymbol: string;
  tokenType: EVMTokenEnum;
  bridgeType: EVMTokenBridgeEnum;
  address: `0x${string}`;
  abi: Abi;
  decimals: number;
  chainId: PresetTypedChainId;
  hyperlaneRouteContractAddress?: `0x${string}`;
}

export type BridgeChainsConfigType = Record<
  PresetTypedChainId,
  Record<
    PresetTypedChainId,
    {
      supportedTokens: BridgeTokenType[];
    }
  >
>;

export type TokenBalanceType = BridgeTokenType & {
  balance: Decimal;
};

export type BalanceType = Partial<
  Record<PresetTypedChainId, TokenBalanceType[]>
>;
