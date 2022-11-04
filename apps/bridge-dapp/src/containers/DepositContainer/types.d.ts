import {
  ChainType,
  TokenType,
} from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { PropsOf } from '@webb-tools/webb-ui-components/types';

export interface DepositContainerProps extends PropsOf<'div'> {
  // Actions to take on 'deposit' button click
  // (e.g. generateNote for passing to the <DepositConfirm />)
  onDeposit?: () => void;
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
}
