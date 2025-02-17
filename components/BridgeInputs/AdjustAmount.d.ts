import { AdjustAmountProps } from './types';
/**
 * The `AdjustAmount` component
 *
 * Props:
 *
 * - `id`: The `id` prop for label and input (defaults to "adjust-amount")
 * - `value`: The value prop
 * - `onChange`: The callback function to control the component
 * - `min`: The minimum value
 * - `max`: The maximum value
 * - `step`: The step value (defaults to 0.5)
 *
 * @example
 *
 * ```jsx
 * <AdjustAmount value={value} onChange={(nextVal) => setValue(nextVal)} />
 * ```
 */
export declare const AdjustAmount: import('../../../../../node_modules/react').ForwardRefExoticComponent<AdjustAmountProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
