import { TransactionPayload } from '@webb-tools/webb-ui-components';
import {
  ChainType,
  TokenType,
} from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { BridgeTabContainerProps } from '../types';

export interface DepositContainerProps
  extends BridgeTabContainerProps,
    PropsOf<'div'> {
  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<
    React.SetStateAction<Partial<TransactionPayload>>
  >;
}

export interface DepositConfirmContainerProps extends PropsOf<'div'> {
  /**
   * The deposit payload
   */
  depositPayload: DepositPayload;

  /**
   * The deposit amount
   */
  amount: number;

  /**
   * The selected token to deposit
   */
  token?: TokenType;

  /**
   * The source chain
   */
  sourceChain?: ChainType;

  /**
   * The destination chain
   */
  destChain?: ChainType;

  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<
    React.SetStateAction<Partial<TransactionPayload>>
  >;
  /**
   * The signal to wrap and deposit flow
   * */
  wrappingFlow: boolean;
}
