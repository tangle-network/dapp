import * as LabelPrimitive from '@radix-ui/react-label';

import { LabelProps } from './types';

/**
 * The accessible `Label` component
 *
 * @example
 *
 * ```jsx
 *  <Label className='font-bold uppercase body4' htmlFor="username">
 *    Username
 *  </Label>
 * ```
 */
export const Label: React.FC<LabelProps> = (props) => {
  return <LabelPrimitive.Root {...props} />;
};
