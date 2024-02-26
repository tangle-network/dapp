import { twMerge } from 'tailwind-merge';

import { ButtonClassNames, ButtonSize, ButtonVariant } from './types';

const classNames: ButtonClassNames = {
  primary: {
    base: {
      common:
        'rounded-full px-9 py-2 bg-mono-200 border-2 border-transparent text-mono-0 font-bold dark:bg-mono-20 dark:border-2 dark:border-mono-20 dark:text-mono-180',
      hover: 'hover:bg-mono-160 dark:hover:bg-mono-40',
      active:
        'active:border-mono-200 dark:active:bg-mono-20 dark:active:border-mono-160 dark:active:text-mono-180',
      disabled:
        'disabled:bg-mono-80 dark:disabled:bg-mono-80 dark:disabled:border-transparent dark:disabled:text-mono-0',
    },
    md: 'body1',
    sm: 'body3',
  },
  secondary: {
    base: {
      common:
        'rounded-full px-9 py-2 bg-mono-0 border-2 border-mono-200 text-mono-200 font-bold dark:bg-mono-180 dark:border-mono-20 dark:text-mono-20',
      hover:
        'hover:border-mono-140 hover:text-mono-140 dark:hover:border-mono-100 dark:hover:text-mono-60 dark:hover:border-mono-60',
      active: 'active:bg-mono-20 dark:active:text-mono-0',
      disabled:
        'disabled:border-mono-100 disabled:text-mono-100 disabled:bg-mono-20 dark:disabled:border-mono-100 dark:disabled:text-mono-100 dark:disabled:bg-mono-20',
    },
    md: 'body1',
    sm: 'body3',
  },
  utility: {
    base: {
      common:
        'rounded-lg px-3 py-2 bg-blue-0 border border-transparent text-blue-70 dark:bg-blue-120 dark:text-blue-50 font-bold',
      hover: 'hover:bg-blue-10 hover:text-blue-90 dark:hover:bg-blue-110',
      active: 'active:border-blue-50 dark:active:border-blue-50',
      disabled:
        'disabled:bg-blue-10 disabled:text-blue-70 disabled:border-transparent dark:disabled:bg-blue-120 dark:disabled:text-blue-50 disabled:opacity-50',
    },
    md: 'body1',
    sm: 'body4 uppercase',
  },
  link: {
    base: {
      common:
        'text-blue-70 border-b-2 border-b-transparent dark:text-blue-50 font-bold',
      hover:
        'hover:border-blue-70 dark:hover:text-blue-30 dark:hover:border-blue-30',
      active:
        'active:text-blue-90 active:border-blue-90 dark:active:text-blue-30 dark:active:border-blue-30',
      disabled: 'disabled:text-blue-40 disabled:dark:text-blue-90',
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
  size: ButtonSize
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
    disabled
  );
}
