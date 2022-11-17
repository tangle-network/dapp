import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { ActiveWebbRelayer, WebbRelayer } from '@webb-tools/abstract-api-provider';

export interface WithdrawContainerProps extends PropsOf<'div'> {
  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<React.SetStateAction<Partial<TransactionPayload>>>;
}

export interface WithdrawConfirmContainerProps extends PropsOf<'div'> {
  /**
   * The note which controls change after the withdraw
   */
  changeNote?: string;
  availableNotes: Note[];

  /**
   * The withdraw amount
   */
  amount: number;
  changeAmount: number;
  fees: number;
  recipient: string;

  /**
   * The token to withdraw
   */
  webbToken: TokenType;

  relayer?: ActiveWebbRelayer;

  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<
    React.SetStateAction<Partial<TransactionPayload>>
  >;
}
