import { CheckBoxMenuProps } from './types';
/**
 * The `CheckBoxMenu` component
 *
 * Props:
 *
 * - `icon`: The optional icon displayed after the text
 * - `label`: The label to be displayed could be string or JSX
 *
 * @example
 *
 * ```jsx
 *  <CheckBoxMenu icon={<Filter />} label={Filter}/>
 *  <CheckBoxMenu
 *    checkboxProps={{ isChecked: isChecked }}
 *    icon={<Filter />} label={<h3>Filter</Filter>} onChange={() =>{ }
 *  />
 * ```
 */
export declare const CheckBoxMenu: import('../../../../../node_modules/react').ForwardRefExoticComponent<CheckBoxMenuProps & import('../../../../../node_modules/react').RefAttributes<HTMLLabelElement>>;
