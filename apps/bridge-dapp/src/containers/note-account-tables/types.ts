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
   * The callback to delete notes
   * @param {Note[]} notes - The notes to delete
   * @returns void
   */
  onDeleteNotesChange?: (notes: Note[]) => void;

  /**
   * Global search text
   * */
  globalSearchText: string;
}

export interface ActionWithTooltipProps extends ButtonProps {
  /**
   * The tooltip content
   */
  tooltipContent: string;
}
