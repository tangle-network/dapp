import { DialogContentProps } from '@radix-ui/react-dialog';

export interface ModalContentProps extends DialogContentProps {
  /**
   * Require prop for transition component
   */
  isOpen: boolean;

  /**
   * Centered the modal
   */
  isCenter?: boolean;
}
