import { ButtonSize, ButtonVariant } from './types';
/**
 * Get the tailwind class name to style the button based on variant
 * @param variant Represents the button variant
 * @param darkMode Variable to control dark mode in `js`
 * @returns tailwind className to style to button based on variant
 */
export declare function getButtonClassNameByVariant(variant: ButtonVariant, size: ButtonSize): string;
