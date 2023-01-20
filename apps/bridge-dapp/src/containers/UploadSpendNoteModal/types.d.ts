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

export interface UploadModalContentProps extends BaseUploadModalContentProps {
  /**
   * True if the user wants to re-upload the note
   */
  reUploadNote: boolean;

  /**
   * Handler to set if the user wants to re-upload the note
   */
  handleReUploadNote: () => void;
}

export interface PasteModalContentProps extends BaseUploadModalContentProps {}
