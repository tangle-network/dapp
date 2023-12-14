import type { Transition } from '@headlessui/react';
import type { DialogContentProps } from '@radix-ui/react-dialog';
import type { AnimationEventHandler } from 'react';
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
  overrideTransitionRootProps?: Partial<PropsOf<typeof Transition.Root>>;

  /**
   * Props to override the transition overlay component
   */
  overrideTransitionOverlayProps?: Partial<PropsOf<typeof Transition.Child>>;

  /**
   * Props to override the transition content component
   */
  overrideTransitionContentProps?: Partial<PropsOf<typeof Transition.Child>>;
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
