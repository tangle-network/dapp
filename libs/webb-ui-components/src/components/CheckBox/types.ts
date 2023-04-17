import { ComponentProps } from 'react';

import { Button } from '../Button';
import { WebbComponentBase } from '../../types';
import { WebbTypographyVariant } from '../../typography/types';

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
   * @default "ml-4"
   * @type tailwind spacing
   */
  spacingClassName?: string;

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

  /**
   * The label typography variant
   * @default "body1"
   */
  labelVariant?: WebbTypographyVariant;

  /**
   * More info about the checkbox
   */
  info?: Partial<{
    /**
     * The title of the info
     */
    title: string;

    /**
     * The content of the info
     */
    content: string;

    /**
     * The text of the button
     * @default "Learn more"
     */
    buttonText: string;

    /**
     * Other props to be forwarded to the button (e.g. `href`, `onClick`)
     */
    buttonProps: ComponentProps<typeof Button>;
  }>;
}
