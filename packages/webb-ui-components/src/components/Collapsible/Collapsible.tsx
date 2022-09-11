import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { forwardRef } from 'react';

import { CollapsibleProps } from './types';

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>((props, ref) => {
  return <CollapsiblePrimitive.Root {...props} ref={ref} />;
});
