import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { forwardRef } from 'react';

import { CollapsibleProps } from './types';

/**
 * The wrapper around Radix Collapsible Root, use for displaying collapsible content
 *
 * @example
 *
 * ```jsx
 *    <Collapsible>
 *      <CollapsibleButton>Click to expand</CollapsibleButton>
 *      <CollapsibleContent>Expanded section</CollapsibleContent>
 *    </Collapsible>
 * ```
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>((props, ref) => {
  return <CollapsiblePrimitive.Root {...props} ref={ref} />;
});
