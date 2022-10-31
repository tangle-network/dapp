import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC } from 'react';

import { PopoverProps } from './types';

export const Popover: FC<PopoverProps> = (props) => {
  return <PopoverPrimitive.Popover {...props} />;
};
