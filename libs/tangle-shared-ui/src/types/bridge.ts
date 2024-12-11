import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';

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