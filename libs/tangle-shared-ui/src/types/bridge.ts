export enum BridgeType {
  HYPERLANE_EVM_TO_EVM = 'hyperlane-evmToEvm',
}

export enum BridgeTxState {
  Initializing = 'Initializing',

  Sending = 'Sending',

  Executed = 'Executed',

  Failed = 'Failed',

  /** The tx is done indexing but still pending (Hyperlane txs only) */
  HyperlanePending = 'HyperlanePending',

  /** The tx is being indexed (Hyperlane txs only) */
  HyperlaneIndexing = 'HyperlaneIndexing',

  /** The tx is delivered to the destination chain (Hyperlane txs only) */
  HyperlaneDelivered = 'HyperlaneDelivered',

  /** The tx is executed on the destination chain (Hyperlane txs only) */
  HyperlaneExecuted = 'HyperlaneExecuted',

  /** The tx has failed on the destination chain (Hyperlane txs only) */
  HyperlaneFailed = 'HyperlaneFailed',
}

export type BridgeQueueTxItem = {
  hash: string;
  hyperlaneTxId?: string;
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
  type: BridgeType;
  explorerUrl?: string;
  destinationTxHash?: string;
  destinationTxState?: BridgeTxState;
  destinationTxExplorerUrl?: string;
};
