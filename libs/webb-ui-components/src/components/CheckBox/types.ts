import { WebbComponentBase } from '../../types';

/**
 * CheckBox Props
 */
export interface CheckBoxProps extends WebbComponentBase {
  /**
   * If `true`, the checkbox will be disabled
   */
  isDisabled?: boolean;
  /**
   * The spacing between the checkbox and its label text
   * @default 4
   * @type tailwind spacing
   */
  spacing?: number;
  /**
   * If `true`, the checkbox will be checked.
   * You'll need to pass `onChange` to update its value (since it is now controlled)
   */
  isChecked?: boolean;
  /**
   * The callback invoked when the checked state of the `Checkbox` changes.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Additional props to be forwarded to the `input` element
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /**
   * Class name in case of overriding the tailwind class of the `<label></label>` tag
   */
  labelClassName?: string;
  /**
   * Class name in case of overriding the tailwind class of the checkbox container
   */
  wrapperClassName?: string;
}
