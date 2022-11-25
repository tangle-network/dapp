import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  ActiveWebbRelayer,
  WebbRelayer,
} from '@webb-tools/abstract-api-provider';

export interface WithdrawContainerProps extends PropsOf<'div'> {
  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<
    React.SetStateAction<Partial<TransactionPayload>>
  >;
}

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
  webbToken: TokenType;

  /**
   * The unwrap token
   */
  unwrapToken?: TokenType;

  /**
   * The relayer to use
   */
  relayer?: ActiveWebbRelayer;

  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<
    React.SetStateAction<Partial<TransactionPayload>>
  >;
}
