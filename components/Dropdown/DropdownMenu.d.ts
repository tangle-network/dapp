import { DropdownMenuProps } from './types';
/**
 * The `DropdownMenu` component
 *
 * - `size`: The `Dropdown` size
 * - `label`: The label to be display, if not provided, the `Dropdown` trigger will display the value property
 * - `icon`: The icon before the `Dropdown` label
 * - `menuOptions`: Options array to display
 * - `value`: Current selected value (default will get the first item in the option list)
 * - `onChange`: Callback function to update the value
 *
 * ```jsx
 *  <DropdownMenu className='mr-3' size='sm' label='Filter' icon={<Filter />} menuOptions={dropdownOptions} />
 *  <DropdownMenu
 *    label='Brand'
 *    menuOptions={dropdownOptions}
 *    value={value}
 *    onChange={(nextVal) => setValue(nextVal)}
 *  />
 * ```
 */
declare const DropdownMenu: import('../../../../../node_modules/react').ForwardRefExoticComponent<DropdownMenuProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
export default DropdownMenu;
