import { ReactElement } from 'react';

import { PropsOf } from '../../types';
import { ButtonProps } from '../Button';

export interface ErrorFallbackProps extends PropsOf<'div'> {
  /**
   * The error title to display
   * @default "Oops something went wrong."
   */
  title?: string;

  /**
   * The error description to display,
   * can be a string or a react element (string with links, etc.).
   * When noWrapper is true, the children will be rendered without a wrapper (`<Typography />`)
   */
  description?: Array<string | { noWrapper: boolean; children: ReactElement }>;

  /**
   * The button prop list for displaying the buttons in the error fallback component.
   * if not provided, the default button will be rendered
   * (refresh page and report issue)
   */
  buttons?: Array<ButtonProps>;

  /**
   * Contact us link props
   */
  contactUsLinkProps?: ButtonProps;

  /**
   * Refresh page button props
   */
  refreshPageButtonProps?: ButtonProps;

  /**
   * Report issue button props
   */
  reportIssueButtonProps?: ButtonProps;
}
