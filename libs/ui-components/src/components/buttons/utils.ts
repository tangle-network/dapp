import { buttonVariants } from '@tangle-network/ui/primitives';
import type { ButtonSize, ButtonVariant } from './types';

const variants = {
  primary: 'default',
  secondary: 'outline',
  utility: 'secondary',
  link: 'link',
} as const;

// Preserve the dapp's public variant names while the shared UI owns styling.
export const getButtonClassNameByVariant = (
  variant: ButtonVariant,
  size: ButtonSize,
) =>
  buttonVariants({
    variant: variants[variant],
    size: size === 'md' ? 'default' : 'sm',
  });
