import type { Transition, TransitionChild } from '@headlessui/react';
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

  /**
   * Props to override the transition component
   */
  overrideTransitionRootProps?: Partial<PropsOf<typeof Transition>>;

  /**
   * Props to override the transition overlay component
   */
  overrideTransitionOverlayProps?: Partial<PropsOf<typeof TransitionChild>>;

  /**
   * Props to override the transition content component
   */
  overrideTransitionContentProps?: Partial<PropsOf<typeof TransitionChild>>;
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
