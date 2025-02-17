import { ChipColors } from './types';
/**
 * Get the Tailwind class name for `Chip` component based on `color` and `isDisabled`
 * @param color The chip color
 * @param isDisabled If `true` return the style for disabled state
 * @returns Tailwind class name for style the `Chip` component
 */
export declare function getChipClassName(color: ChipColors, isDisabled?: boolean, isSelected?: boolean): {
    activeOrDisable: string;
    selected: string;
};
