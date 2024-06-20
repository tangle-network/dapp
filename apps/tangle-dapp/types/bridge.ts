import type { HexString } from '@polkadot/util/types';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import Decimal from 'decimal.js';

// NOTE: might need to add cases when Sygma SDK does not support
export enum BridgeType {
  SYGMA_EVM_TO_EVM = 'sygma-evmToEvm',
  SYGMA_EVM_TO_SUBSTRATE = 'sygma-evmToSubstrate',
  SYGMA_SUBSTRATE_TO_EVM = 'sygma-substrateToEvm',
  SYGMA_SUBSTRATE_TO_SUBSTRATE = 'sygma-substrateToSubstrate',
}

// Supported tokens to be used in the bridge
export type BridgeTokenId = 'tTNT' | 'TNT' | 'sygUSD';

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
   * The id of an asset on Substrate chain pallet
   */
  substrateAssetId?: Partial<Record<ChainId, number>>;

  /**
   * The id of the token provided in the SygmaSDK docs
   */
  sygmaResourceId?: string;
};

export enum BridgeWalletError {
  MismatchEvm = 'WALLET_MISMATCH_EVM',
  MismatchSubstrate = 'WALLET_MISMATCH_SUBSTRATE',
}

export enum BridgeTxState {
  SigningTx = 'Signing Transaction', // The user is signing the tx
  SendingTx = 'Sending Transaction', // The user done signing, the tx is being sent to the source chain

  Indexing = 'Indexing', // The tx is being indexed by Sygma

  Executed = 'Executed', // The tx is executed successfully
  Failed = 'Failed', // The tx is failed
}

export type BridgeQueueTxItem = {
  id: string;
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  sourceAddress: string;
  recipientAddress: string;
  sourceAmount: string;
  destinationAmount: string;
  tokenSymbol: string;
  createdAt: Date;
  state: BridgeTxState;
  explorerUrl?: string;
};
