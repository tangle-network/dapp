import { Note } from '@webb-tools/sdk-core';

export interface DeleteNotesModalProps {
  /**
   * The notes to be deleted
   */
  notes?: Note[];

  /**
   * The callback to set the notes to be deleted
   * @param notes
   */
  setNotes?: (notes?: Note[]) => void;
}
