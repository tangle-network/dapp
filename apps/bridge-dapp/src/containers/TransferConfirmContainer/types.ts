import { ActiveWebbRelayer, Currency } from '@webb-tools/abstract-api-provider';
import { Chain } from '@webb-tools/dapp-config';
import { Note, Utxo } from '@webb-tools/sdk-core';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { BridgeTabContainerProps } from '../types';

export type CurrencyRecord = Record<Currency['id'], Currency>;

export type ChainRecord = Record<number, Chain>;

/**
 * The currencies record with key as currency id and value as currency
 * along with destination chains corresponding to the currency
 */
export type CurrencyRecordWithChainsType = Record<
  Currency['id'],
  {
    currency: Currency;
    destChainRecord: ChainRecord;
  }
>;

/**
 * The currency balance on different chains
 */
export type CurrencyBalanceRecordType = Record<
  Currency['id'],
  Record<number, number> // chainId -> balance
>;

export interface TransferContainerProps
  extends BridgeTabContainerProps,
    PropsOf<'div'> {}

export interface TransferConfirmContainerProps
  extends Omit<PropsOf<'div'>, 'onCopy'> {
  /**
   * The transfer bridging asset
   */
  currency: Currency;

  /**
   * The destination chain
   */
  destChain: Chain;

  /**
   * The amount to transfer
   */
  amount: number;

  /**
   * The change amount
   */
  changeAmount: number;

  /**
   * The active relayer
   */
  relayer: ActiveWebbRelayer | null;

  /**
   * The recipient public key
   */
  recipient: string;

  /**
   * The change note
   */
  note?: Note;

  /**
   * The input notes to transfer
   */
  inputNotes: Note[];

  /**
   * The generated change utxo,
   * this will be stored on-chain
   */
  changeUtxo: Utxo;

  /**
   * The generated transfer utxo,
   * this will be stored on-chain
   */
  transferUtxo: Utxo;

  /**
   * The callbacl to reset the parent state
   * @returns void
   */
  onResetState?: () => void;

  /**
   * The callback to close the card
   */
  onClose?: () => void;

  /**
   * The fee amount
   */
  feeInWei?: bigint | null;

  /**
   * The fee token
   */
  feeToken?: string;

  /**
   * The refund recipient
   */
  refundRecipient?: string;

  /**
   * The refund amount
   */
  refundAmount?: bigint;

  /**
   * The refund token
   */
  refundToken?: string;
}
