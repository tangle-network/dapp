import { ChainBase } from '@webb-tools/dapp-config';
import { Note } from '@webb-tools/sdk-core';
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
  note: Note;

  /**
   * The deposit amount
   */
  amount: number;

  /**
   * The source chain
   */
  sourceChain?: {
    type: ChainBase;
    name: string;
  };

  /**
   * The destination chain
   */
  destChain?: {
    type: ChainBase;
    name: string;
  };

  /**
   * The fungible token id
   */
  fungibleTokenId: number;

  /**
   * The wrapped token id
   */
  wrappableTokenId?: number;

  /**
   * Function to reset the main component
   * @returns void
   */
  resetMainComponent: () => void;

  /**
   * The callback to reset the parent state
   * @returns void
   */
  onResetState?: () => void;

  /**
   * The fee amount
   */
  feeValue?: number;

  /**
   * The fee token
   */
  feeToken?: string;
}
