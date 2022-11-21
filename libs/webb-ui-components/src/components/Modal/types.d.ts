import { DialogContentProps } from '@radix-ui/react-dialog';
import { PropsOf } from '../../types';

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

export interface ModalHeaderProps extends PropsOf<'div'> {
  /**
   * The callback when user hits close icon
   */
  onClose?: PropsOf<'button'>['onClick'];
}
