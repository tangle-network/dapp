import { ButtonProps } from './types';
/**
 * The Button Component
 *
 * Props:
 *
 * - `isLoading`: If `true`, the button will show a spinner
 * - `isDisabled`: If `true`, the button will be disabled
 * - `loadingText`: The label to show in the button when `isLoading` is true. If no text is passed, it only shows the spinner
 * - `variant`: The button variant (default `primary`)
 * - `leftIcon`: If added, the button will show an icon before the button's label
 * - `rightIcon`:If added, the button will show an icon after the button's label
 * - `spinner`: Replace the spinner component when `isLoading` is set to `true`
 * - `spinnerPlacement`: It determines the placement of the spinner when `isLoading` is `true`
 * - `size`: The button size
 *
 * @example
 *
 * ```jsx
 *  <Button variant="secondary">Button</Button>
 *  <Button variant="utility" isLoading>Button</Button>
 * ```
 */
declare const Button: import('../../../../../node_modules/react').ForwardRefExoticComponent<ButtonProps & import('../../../../../node_modules/react').RefAttributes<HTMLElement>>;
export default Button;
