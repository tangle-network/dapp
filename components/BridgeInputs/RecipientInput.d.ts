import { RecipientInputProps } from './types';
/**
 * The `RecipientInput` component
 *
 * Props:
 *
 * - `value`: The input value
 * - `onChange`: Callback function to control the input value
 *
 * @example
 *
 * ```jsx
 *   <RecipientInput {...recipientInputProps} />
 *  <RecipientInput value={recipient} onChange={(nextVal) => setRecipient(nextVal.toString())} />
 * ```
 */
export declare const RecipientInput: import('../../../../../node_modules/react').ForwardRefExoticComponent<RecipientInputProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
