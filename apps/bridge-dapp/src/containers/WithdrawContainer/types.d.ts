import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  ActiveWebbRelayer,
  Currency,
  WebbRelayer,
} from '@webb-tools/abstract-api-provider';
import { TransactionPayload } from '@webb-tools/webb-ui-components';
import { BridgeTabContainerProps } from '../types';
import { Note, Utxo } from '@webb-tools/sdk-core';

export interface WithdrawContainerProps
  extends BridgeTabContainerProps,
    PropsOf<'div'> {}

export type CurrencyWithBalance = { value: Currency } & Omit<
  TokenType,
  'symbol'
>;

export interface WithdrawConfirmContainerProps extends PropsOf<'div'> {
  /**
   * The change utxo (or dummy utxo if the changeAmount is `0`),
   * this will be added on chain
   */
  changeUtxo: Utxo;

  /**
   * The note which controls change after the withdraw
   */
  changeNote?: Note;

  /**
   * The available notes
   */
  availableNotes: Note[];

  /**
   * The withdraw amount
   */
  amount: number;

  /**
   * The change amount
   */
  changeAmount: number;

  /**
   * The fee number
   */
  fees: number;

  /**
   * Recipient address
   */
  recipient: string;

  /**
   * The target chain id
   */
  targetChainId: number;

  /**
   * The token to withdraw
   */
  fungibleCurrency: CurrencyWithBalance;

  /**
   * The unwrap token
   */
  unwrapCurrency?: CurrencyWithBalance;

  /**
   * The callback to reset the parent state
   * @returns void
   */
  onResetState?: () => void;
}
