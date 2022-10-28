import { WebbComponentBase } from '../../types';

/**
 * The option list of `DropdownMenu` component
 */
export type DropDownMemuOption = {
  /**
   * The item value and the display text
   */
  value: string;
  /**
   * Item icon
   */
  icon?: React.ReactElement;
};

/**
 * Dropdown Menu component
 */
export interface DropdownMenuProps extends Omit<WebbComponentBase, 'onChange'> {
  /**
   * The `Dropdown` size
   */
  size?: 'md' | 'sm';
  /**
   * The label to be display, if not provided, the `Dropdown` trigger will display the value property
   */
  label?: string;
  /**
   * The icon before the `Dropdown` label
   */
  icon?: React.ReactElement;
  /**
   * Options array to display
   */
  menuOptions: Array<DropDownMemuOption>;
  /**
   * Current selected value
   */
  value?: string;
  /**
   * Callback function to update the value
   */
  onChange?: (nextValue: string) => void;
}
