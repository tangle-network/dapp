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
// TODO: Remove SygmaUSD when Tangle is ready in the SDK
export type BridgeTokenId = 'tTNT' | 'TNT';

export type ChainId = PresetTypedChainId;

export type BridgeTokenType = {
  id: BridgeTokenId;
  symbol: string; // this is also used to get the token icon

  /**
   * The number of decimal places allowed for the token on each chain
   * This is required when calculating the amount when transferring tokens between chains
   * since each chain will have a different decimal places
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
};
