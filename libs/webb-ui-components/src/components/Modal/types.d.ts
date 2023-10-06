import type { DialogContentProps } from '@radix-ui/react-dialog';
import type { PropsOf } from '../../types';
import type { WebbTypographyVariant } from '../../typography/types';

export interface ModalContentProps extends DialogContentProps {
  /**
   * Require prop for transition component
   */
  isOpen: boolean;

  /**
   * Centered the modal
   */
  isCenter?: boolean;

  /**
   * Whether using portal to render modal
   */
  usePortal?: boolean;
}

export interface ModalHeaderProps extends PropsOf<'div'> {
  /**
   * The callback when user hits close icon
   */
  onClose?: PropsOf<'button'>['onClick'];

  /**
   * The title variant of the modal
   * @default 'h5'
   */
  titleVariant?: WebbTypographyVariant;
}
