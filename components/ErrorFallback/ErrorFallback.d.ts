import { ErrorFallbackProps } from './types';
/**
 * The `ErrorFallback` component, used to display an error message when an UI error occurs.
 *
 * - `title`: The error title to display (default is "Oops something went wrong.)
 * - `description`: The error description to display, can be a string or a react element (string with links, etc.). When noWrapper is true, the children will be rendered without a wrapper (`<Typography />`)
 * - `buttons`: The button prop list for displaying the buttons in the error fallback component. if not provided, the default button will be rendered (refresh page and report issue)
 * - `contactUsLinkProps`: Contact us link props, for overriding the default props
 * - `refreshPageButtonProps`: Refresh page button props for overriding the default props
 * - `reportIssueButtonProps`: Report issue button props for overriding the default props
 *
 * ```jsx
 *  <ErrorFallback className='mr-3' />
 *  <ErrorFallback
 *    title='An error occurred'
 *    description='Please refresh the page or try again later.'
 *  />
 * ```
 */
export declare const ErrorFallback: import('../../../../../node_modules/react').ForwardRefExoticComponent<ErrorFallbackProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
