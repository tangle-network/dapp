import { ChipClassNames, ChipColors } from './types';

const classNames: ChipClassNames = {
  blue: {
    active: 'text-blue-90 bg-blue-10 dark:text-blue-30 dark:bg-blue-120',
    disabled: 'bg-blue-10 text-blue-40 dark:bg-blue-120 dark:text-blue-90',
    selected: 'border-solid border-2 border-blue-90 dark:border-blue-30',
  },
  green: {
    active: 'bg-green-10 text-green-90 dark:bg-green-120 dark:text-green-50',
    disabled: 'bg-green-10 text-green-40 dark:bg-green-120 dark:text-green-90',
    selected: 'border-solid border-2 border-green-90 dark:border-green-50',
  },
  purple: {
    active:
      'bg-purple-10 text-purple-90 dark:bg-purple-120 dark:text-purple-50',
    disabled:
      'bg-purple-10 text-purple-40 dark:bg-purple-120 dark:text-purple-90',
    selected: 'border-solid border-2 border-purple-90 dark:border-purple-50',
  },
  red: {
    active: 'bg-red-10 text-red-90 dark:bg-red-120 dark:text-red-50',
    disabled: 'bg-red-10 text-red-40 dark:bg-red-120 dark:text-red-90',
    selected: 'border-solid border-2 border-red-90 dark:border-red-50',
  },
  yellow: {
    active:
      'bg-yellow-10 text-yellow-90 dark:bg-yellow-120 dark:text-yellow-50',
    disabled:
      'bg-yellow-10 text-yellow-40 dark:bg-yellow-120 dark:text-yellow-90',
    selected: 'border-solid border-2 border-yellow-90 dark:border-yellow-30',
  },
  grey: {
    active: 'bg-inherit text-mono-120 dark:inherit dark:text-mono-80',
    disabled:
      'bg-mono-200/[5%] text-mono-160 dark:bg-mono-0/[5%] dark:text-mono-0',
    selected: 'border-solid border-2 border-mono-120 dark:border-mono-80',
  },
};

/**
 * Get the Tailwind class name for `Chip` component based on `color` and `isDisabled`
 * @param color The chip color
 * @param isDisabled If `true` return the style for disabled state
 * @returns Tailwind class name for style the `Chip` component
 */
export function getChipClassName(
  color: ChipColors,
  isDisabled?: boolean,
  isSelected?: boolean
) {
  const { active, disabled, selected } = classNames[color];
  return {
    activeOrDisable: isDisabled ? disabled : active,
    selected: isSelected ? selected : '',
  };
}
