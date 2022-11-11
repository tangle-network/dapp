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
