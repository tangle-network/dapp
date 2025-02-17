import { InputProps } from './types';
/**
 * The `Input` component
 *
 * Props:
 *
 * - `id`: The input id
 * - `htmlSize`: The native HTML `size` attribute to be passed to the `input`
 * - `isRequired`: The `required` attribute of input tab
 * - `isDisabled`: The `disabled` attribute of input tab
 * - `isRequired`: If `true`, the form control will be readonly
 * - `isValid`: If `true`, the input will change to the error state
 * - `value`: The input value, change the value by `onChange` function for controlled component
 * - `onChange`: The `onChange` function to control the value of the input
 * - `errorMessage`: The error message to be displayed if the input is invalid
 * - `leftIcon`: If added, the input will show an icon before the input value
 * - `rightIcon`: If added, the button will show an icon after the input value
 *
 * @example
 *
 * ```jsx
 *  <Input id='default' />
 *  <Input id='placeholder' placeholder='With placeholder' className='mt-3' />
 *  <Input id='readonly' value='Readonly' isReadOnly className='mt-3' />
 *  <Input
 *    id='disabled'
 *    isDisabled
 *    value='isDisabled'
 *    leftIcon={<Graph className='fill-current dark:fill-current' />}
 *    className='mt-3'
 *  />
 *  <Input id='invalid' isInvalid value='isInvalid' className='mt-3' />
 *  <Input id='withError' isInvalid value='With Error' errorMessage='Error message' className='mt-3' />
 *  <Input id='iconLeft' value='Icon left' leftIcon={<Coin size='xl' />} className='mt-3' />
 *  <Input id='iconRight' value='Icon right' rightIcon={<Search size='xl' />} className='mt-3' />
 * ```
 */
export declare const Input: React.FC<InputProps>;
