import type { Note } from '@webb-tools/sdk-core';
import { ButtonProps } from '@webb-tools/webb-ui-components';

export interface MoreOptionsDropdownProps {
  /**
   * Callback to download notes
   * @param notes the notes to download
   * @returns void
   */
  onDownloadNotes: () => void;

  /**
   * Callback to delete notes
   * @param notes the notes to delete
   * @returns void
   */
  onDeleteNotes: () => void;
}

export interface NoteAccountTableContainerProps {
  /**
   * The upload spend note callback
   */
  onUploadSpendNote?: () => void;

  /**
   * The callback to update the active tab when action button is clicked
   * @param {'Deposit' | 'Withdraw' | 'Transfer'} tabName - The tab name
   */
  onActiveTabChange?: (tabName: 'Deposit' | 'Withdraw' | 'Transfer') => void;

  /**
   * The callback to update the default destination chain
   * @param {Chain} chain - The chain object
   */
  onDefaultDestinationChainChange?: (chain: Chain) => void;

  /**
   * The callback to update the default fungible currency
   * @param {Currency} currency - The currency object
   */
  onDefaultFungibleCurrencyChange?: (currency: Currency) => void;

  /**
   * The callback to delete notes
   * @param {Note[]} notes - The notes to delete
   * @returns void
   */
  onDeleteNotesChange?: (notes: Note[]) => void;
}

export interface ActionWithTooltipProps extends ButtonProps {
  /**
   * The tooltip content
   */
  tooltipContent: string;
}
