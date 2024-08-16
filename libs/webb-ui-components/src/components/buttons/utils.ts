import { twMerge } from 'tailwind-merge';

import type { ButtonClassNames, ButtonSize, ButtonVariant } from './types';

const classNames: ButtonClassNames = {
  primary: {
    base: {
      common:
        'rounded-full px-9 py-2 bg-purple-40 border-2 border-transparent text-mono-0 font-bold dark:bg-purple-50 dark:border-2 dark:border-purple-50',
      hover:
        'hover:bg-purple-50 dark:hover:bg-purple-60 dark:hover:border-purple-60',
      active:
        'active:bg-purple-60 dark:active:bg-purple-70 dark:active:border-purple-70',
      disabled:
        'disabled:bg-mono-80 dark:disabled:bg-mono-120 dark:disabled:border-transparent dark:disabled:text-mono-60',
    },
    md: 'body1',
    sm: 'body3',
  },
  secondary: {
    base: {
      common:
        'rounded-full px-9 py-2 bg-mono-0 border border-mono-200 text-mono-200 font-bold dark:bg-mono-180 dark:border-mono-0 dark:text-mono-0',
      hover:
        'hover:border-mono-180 hover:text-mono-180 hover:bg-mono-20 dark:hover:border-mono-20 dark:hover:text-mono-20 dark:hover:border-mono-20 dark:hover:bg-mono-170',
      active:
        'active:bg-mono-40 active:text-mono-180 dark:active:text-mono-20 dark:active:bg-mono-160',
      disabled:
        'disabled:border-mono-100 disabled:text-mono-100 disabled:bg-mono-20 dark:disabled:border-mono-120 dark:disabled:text-mono-120 dark:disabled:bg-mono-160',
    },
    md: 'body1',
    sm: 'body3',
  },
  utility: {
    base: {
      common:
        'rounded-lg px-3 py-2 bg-blue-0 text-blue-60 dark:bg-blue-120 dark:text-blue-40 font-bold border border-transparent',
      hover: 'hover:bg-blue-10 dark:hover:bg-blue-110 dark:hover:text-blue-30',
      active:
        'active:bg-blue-10 active:border-blue-40 dark:active:border-blue-110 dark:active:text-blue-30',
      disabled:
        'disabled:text-blue-30 disabled:border-transparent dark:disabled:bg-blue-120 dark:disabled:text-blue-90 dark:disabled:opacity-50',
    },
    md: 'body1',
    sm: 'body4 uppercase',
  },
  link: {
    base: {
      common: 'text-blue-60 dark:text-blue-50 font-bold',
      hover: 'hover:border-blue-70 dark:hover:text-blue-30',
      active: 'active:text-blue-80 dark:active:text-blue-20',
      disabled: 'disabled:text-blue-30 dark:disabled:text-blue-20',
    },
    md: 'body1',
    sm: 'body4 uppercase',
  },
};

/**
 * Get the tailwind class name to style the button based on variant
 * @param variant Represents the button variant
 * @param darkMode Variable to control dark mode in `js`
 * @returns tailwind className to style to button based on variant
 */
export function getButtonClassNameByVariant(
  variant: ButtonVariant,
  size: ButtonSize,
) {
  const commonClsx =
    'box-border flex justify-center items-center disabled:pointer-events-none text-center disabled:pointer-events-none';
  const { active, common, disabled, hover } = classNames[variant]['base'];
  return twMerge(
    classNames[variant][size],
    commonClsx,
    common,
    hover,
    active,
    disabled,
  );
}
