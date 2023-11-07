import { Note } from '@webb-tools/sdk-core/note';
import { PropsOf } from '@webb-tools/webb-ui-components/types';

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
  sourceTypedChainId?: number;

  /**
   * The destination chain
   */
  destTypedChainId?: number;

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
