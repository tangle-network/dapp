import { ChipClassNames, ChipColors } from './types';

const classNames: ChipClassNames = {
  blue: {
    active: 'bg-blue-10 text-blue-90 dark:bg-blue-120 dark:text-blue-50',
    disabled: 'bg-blue-10 text-blue-40 dark:bg-blue-120 dark:text-blue-90',
  },
  green: {
    active: 'bg-green-10 text-green-90 dark:bg-green-120 dark:text-green-50',
    disabled: 'bg-green-10 text-green-40 dark:bg-green-120 dark:text-green-90',
  },
  purple: {
    active: 'bg-purple-10 text-purple-90 dark:bg-purple-120 dark:text-purple-50',
    disabled: 'bg-purple-10 text-purple-40 dark:bg-purple-120 dark:text-purple-90',
  },
  red: {
    active: 'bg-red-10 text-red-90 dark:bg-red-120 dark:text-red-50',
    disabled: 'bg-red-10 text-red-40 dark:bg-red-120 dark:text-red-90',
  },
  yellow: {
    active: 'bg-yellow-10 text-yellow-90 dark:bg-yellow-120 dark:text-yellow-50',
    disabled: 'bg-yellow-10 text-yellow-40 dark:bg-yellow-120 dark:text-yellow-90',
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
