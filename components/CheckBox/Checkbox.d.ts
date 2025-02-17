import { FC } from '../../../../../node_modules/react';
import { CheckBoxProps } from './types';
/**
 * The `CheckBox` component
 *
 * Props:
 *
 * - `isDisabled`: If `true`, the checkbox will be disabled
 * - `spacing`: The spacing between the checkbox and its label text (default: `4`)
 * - `isChecked`: If `true`, the checkbox will be checked.
 * - `onChange`: The callback invoked when the checked state of the `Checkbox` changes
 * - `inputProps`: Additional props to be forwarded to the `input` element
 * - `htmlFor`: Input id and value for `htmlFor` attribute of `<label></label>` tag
 * - `labelClassName`: Class name in case of overriding the tailwind class of the `<label></label>` tag
 * - `wrapperClassName`: Class name in case of overriding the tailwind class of the checkbox container
 *
 * @example
 *
 * ```jsx
 *  <CheckBox />
 *  <CheckBox isDisabled />
 *  <CheckBox isDisabled>Check mark</CheckBox>
 * ```
 */
export declare const CheckBox: FC<CheckBoxProps>;
