import type { SeparatorProps } from '@radix-ui/react-separator';
import type { IWebbComponentBase, PropsOf } from '../../types';

export interface DividerProps
  extends PropsOf<'div'>,
    SeparatorProps,
    IWebbComponentBase {}
