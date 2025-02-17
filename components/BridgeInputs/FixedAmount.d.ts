import { FixedAmountProps } from './types';
/**
 * The `FixedAmount` component
 *
 * Props:
 *
 * - `id`: The `id` prop for label and input (defaults to "amount")
 * - `values`:  The fixed number list to display
 * - `value`: The value prop
 * - `onChange`: The callback function to control the component
 * - `amountMenuProps`: The amount menu props to pass into the AmountMenu component
 *
 * @example
 *
 * ```jsx
 * <FixedAmount info='Fix amount' values={values} value={value} onChange={(nextVal) => setValue(nextVal)} />
 * <FixedAmount {...fixedAmountProps} className={cx({ hidden: amountType !== 'fixed' })} hidden={amountType !== 'fixed'} />
 * ```
 */
export declare const FixedAmount: import('../../../../../node_modules/react').ForwardRefExoticComponent<FixedAmountProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
