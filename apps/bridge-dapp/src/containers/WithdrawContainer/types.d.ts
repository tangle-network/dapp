import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  ActiveWebbRelayer,
  Currency,
  WebbRelayer,
} from '@webb-tools/abstract-api-provider';
import { TransactionPayload } from '@webb-tools/webb-ui-components';

export interface WithdrawContainerProps extends PropsOf<'div'> {}

export type CurrencyWithBalance = { value: Currency } & Omit<
  TokenType,
  'symbol'
>;

export interface WithdrawConfirmContainerProps extends PropsOf<'div'> {
  /**
   * The note which controls change after the withdraw
   */
  changeNote?: string;

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
  governedCurrency: CurrencyWithBalance;

  /**
   * The unwrap token
   */
  unwrapCurrency?: CurrencyWithBalance;
}
