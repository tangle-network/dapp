import { ChipClassNames, ChipColors } from './types';

const classNames: ChipClassNames = {
  blue: {
    active: 'bg-blue-0 text-blue-90 dark:bg-blue-120 dark:text-blue-30',
    disabled: 'bg-blue-0 text-blue-30 dark:bg-blue-120 dark:text-blue-90 cursor-not-allowed',
  },
  green: {
    active: 'bg-green-0 text-green-100 dark:bg-green-120 dark:text-green-30',
    disabled: 'bg-green-0 text-green-20 dark:bg-green-120 dark:text-green-90 cursor-not-allowed',
  },
  purple: {
    active: 'bg-purple-0 text-purple-100 dark:bg-purple-120 dark:text-purple-30',
    disabled: 'bg-purple-0 text-purple-30 dark:bg-purple-120 dark:text-purple-90 cursor-not-allowed',
  },
  red: {
    active: 'bg-red-0 text-red-100 dark:bg-red-120 dark:text-red-20',
    disabled: 'bg-red-0 text-red-20 dark:bg-red-120 dark:text-red-90 cursor-not-allowed',
  },
  yellow: {
    active: 'bg-yellow-0 text-yellow-100 dark:bg-yellow-120 dark:text-yellow-30',
    disabled: 'bg-yellow-0 text-yellow-30 dark:bg-yellow-120 dark:text-yellow-90 cursor-not-allowed',
  },
};

/**
 * Get the Tailwind class name for `Chip` component based on `color` and `isDisabled`
 * @param color The chip color
 * @param isDisabled If `true` return the style for disabled state
 * @returns Tailwind class name for style the `Chip` component
 */
export function getChipClassName(color: ChipColors, isDisabled?: boolean) {
  const { active, disabled } = classNames[color];
  return isDisabled ? disabled : active;
}
