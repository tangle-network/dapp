import { TransactionPayload } from '@webb-tools/webb-ui-components';
import {
  ChainType,
  TokenType,
} from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { BridgeTabContainerProps } from '../types';

export interface DepositContainerProps
  extends BridgeTabContainerProps,
    PropsOf<'div'> {}

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
   * The signal to wrap and deposit flow
   * */
  wrappingFlow: boolean;
  wrappableTokenSymbol?: string;
  setMainComponentHandler: (x: string | undefined) => void;
}
