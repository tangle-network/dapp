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
// TODO: Remove PHA token later (this is for testing)
export type BridgeTokenId = 'tTNT' | 'TNT' | 'PHA';

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
   * Transaction fee to be paid on the destination chain
   * Use to calculate the minimum amount of token required to be transferred
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
};

export enum BridgeWalletError {
  MismatchEvm = 'wallet-mismatch-evm',
  MismatchSubstrate = 'wallet-mismatch-substrate',
}
