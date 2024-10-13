import type { HexString } from '@polkadot/util/types';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import Decimal from 'decimal.js';

// NOTE: might need to add cases when Sygma SDK does not support
export enum BridgeType {
  HYPERLANE_EVM_TO_EVM = 'hyperlane-evmToEvm',
  SYGMA_EVM_TO_EVM = 'sygma-evmToEvm',
  SYGMA_EVM_TO_SUBSTRATE = 'sygma-evmToSubstrate',
  SYGMA_SUBSTRATE_TO_EVM = 'sygma-substrateToEvm',
  SYGMA_SUBSTRATE_TO_SUBSTRATE = 'sygma-substrateToSubstrate',
}

// Supported tokens to be used in the bridge
// TODO: remove WETH later (this is for testing Hyperlane only)
export type BridgeTokenId = 'tTNT' | 'TNT' | 'sygUSD' | 'WETH';

export type ChainId = PresetTypedChainId;

export type BridgeTokenType = {
  id: BridgeTokenId;
  symbol: string; // this is also used to get the token icon

  /**
   * Number of decimal places the token uses
   * Note: Add key-value here if the token is not native to a chain
   * For native token, use the chain's decimals
   */
  decimals: Partial<Record<ChainId, number>> & { default: number };

  /**
   * This fee is used to pay the XCM fee of the destination chain
   * This will be used when bridging assets across Polkadot parachains using XCM (https://wiki.polkadot.network/docs/learn-xcm)
   */
  destChainTransactionFee: Partial<Record<ChainId, Decimal>>;

  /**
   * Minimum amount of an token required to keep an account active on a blockchain
   * Use to calculate the minimum amount of token required to be transferred
   */
  existentialDeposit: Partial<Record<ChainId, Decimal>>;

  /**
   * Address of the ERC20 contract of the token on the EVM chain
   * TODO: might need type only for EVM Chain Id
   */
  erc20TokenContractAddress?: Partial<Record<ChainId, HexString>>;

  /**
   * Address of the Route Contract of Hyperlane to bridge EVM assets
   */
  hyperlaneRouteContractAddress?: Partial<Record<ChainId, HexString>>;

  /**
   * The id of an asset on Substrate chain pallet
   */
  substrateAssetId?: Partial<Record<ChainId, number>>;

  /**
   * The id of the token provided in the SygmaSDK docs
   */
  sygmaResourceId?: string;
};

export enum BridgeWalletError {
  WalletMismatchEvm = 'WALLET_MISMATCH_EVM',
  WalletMismatchSubstrate = 'WALLET_MISMATCH_SUBSTRATE',
  NetworkMismatchEvm = 'NETWORK_MISMATCH_EVM',
  NetworkMismatchSubstrate = 'NETWORK_MISMATCH_SUBSTRATE',
}

export enum BridgeTxState {
  /** The tx is being initialized */
  Initializing = 'Initializing',

  /** The user is signing the tx */
  Sending = 'Sending',

  /** The tx executed successfully */
  Executed = 'Executed',

  /** The tx has failed */
  Failed = 'Failed',

  /** The tx is being indexed (Sygma txs only) */
  SygmaIndexing = 'SygmaIndexing',

  /** The tx is done indexing but still pending (Sygma txs only) */
  SygmaPending = 'SygmaPending',

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
  sygmaTxId?: string;
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

export enum BridgeFeeType {
  Gas = 'gas',
  SygmaBridge = 'sygmaBridge',
  HyperlaneInterchain = 'hyperlaneInterchain',
}

export type BridgeFeeItem = {
  amount: Decimal | null;
  symbol: string;
  isLoading?: boolean;
};
