import type { DialogContentProps } from '@radix-ui/react-dialog';
import type { PropsOf } from '../../types';
import type { TypographyVariant } from '../../typography/types';

export interface ModalContentProps extends DialogContentProps {
  size?: 'sm' | 'md' | 'lg';

  description?: string;
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
  titleVariant?: TypographyVariant;
}
