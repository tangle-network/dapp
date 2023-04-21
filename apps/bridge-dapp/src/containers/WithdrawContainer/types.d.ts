import { Currency } from '@webb-tools/abstract-api-provider';
import { CurrencyConfig } from '@webb-tools/dapp-config';
import { Note, Utxo } from '@webb-tools/sdk-core';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { BigNumber } from 'ethers';
import { BridgeTabContainerProps } from '../types';

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
  fee: BigNumber;

  /**
   * The amount after fee
   */
  amountAfterFee: BigNumber;

  /**
   * Recipient address
   */
  recipient: string;

  /**
   * Source typed chain id
   */
  sourceTypedChainId: number;

  /**
   * The typed chain id
   */
  targetTypedChainId: number;

  /**
   * The token to withdraw
   */
  fungibleCurrency: CurrencyWithBalance;

  /**
   * The unwrap token
   */
  unwrapCurrency?: CurrencyWithBalance;

  /**
   * Refund amount
   */
  refundAmount?: BigNumber;

  /**
   * Refund token
   */
  refundToken?: string;

  /**
   * The receiving info
   */
  receivingInfo?: ComponentProps<typeof TitleWithInfo>['info'];

  /**
   * The fee info
   */
  feeInfo?: ComponentProps<typeof TitleWithInfo>['info'];

  /**
   * The boolean to check if the user selected refund
   */
  isRefund?: boolean;

  /**
   * The callbacl to reset the parent state
   * @returns void
   */
  onResetState?: () => void;
}
