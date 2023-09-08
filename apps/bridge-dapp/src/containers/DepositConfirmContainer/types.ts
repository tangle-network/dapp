import { ChainGroup } from '@webb-tools/dapp-config/chains/chain-config.interface';
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
  sourceChain?: {
    type: ChainGroup;
    name: string;
  };

  /**
   * The destination chain
   */
  destChain?: {
    type: ChainGroup;
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
