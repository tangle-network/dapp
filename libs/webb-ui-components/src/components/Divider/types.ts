import { SeparatorProps } from '@radix-ui/react-separator';
import { PropsOf, IWebbComponentBase } from '../../types/index.js';

export interface DividerProps
  extends PropsOf<'div'>,
    SeparatorProps,
    IWebbComponentBase {}
