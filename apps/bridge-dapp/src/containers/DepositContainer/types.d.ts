import { ChainBase } from '@webb-tools/dapp-config';
import { Note } from '@webb-tools/sdk-core';
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
   * The callback to reset the parent state
   * @returns void
   */
  onResetState?: () => void;

  /**
   * The callback to close the card
   */
  onClose?: () => void;
}
