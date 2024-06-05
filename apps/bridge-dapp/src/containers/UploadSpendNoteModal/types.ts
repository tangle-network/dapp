import { Note } from '@webb-tools/sdk-core';

export interface UploadSpendNoteModalProps {
  /**
   * Represents the prop to control to modal
   */
  isOpen: boolean;

  /**
   * Function to control the modal
   * @param isOpen new value for isOpen
   */
  setIsOpen: (isOpen: boolean) => void;
}

// The base upload modal content props
export interface BaseUploadModalContentProps {
  /**
   * The callback to set the new notes
   */
  onNotesChange?: (id: string, note: Note) => void;

  /**
   * The callback to remove all notes
   */
  onRemoveAllNotes?: () => void;

  /**
   * The callback to remove a note
   * @param id the id of the note to remove
   */
  onRemoveNote?: (id: string) => void;
}

export interface UploadModalContentProps extends BaseUploadModalContentProps {}

export interface PasteModalContentProps extends BaseUploadModalContentProps {}

export type RefHandle = {
  removeAllNotes: () => void;
};
