import * as LabelPrimitive from '@radix-ui/react-label';

import { LabelProps } from './types';
import { twMerge } from 'tailwind-merge';

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
  return (
    <LabelPrimitive.Root
      {...props}
      className={twMerge(
        'text-mono-120 dark:text-mono-120 font-bold text-lg',
        props.className,
      )}
    />
  );
};
