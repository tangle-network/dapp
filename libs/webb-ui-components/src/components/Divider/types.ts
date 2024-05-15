import type { SeparatorProps } from '@radix-ui/react-separator';
import type { IWebbComponentBase, PropsOf } from '../../types/index.js';

export interface DividerProps
  extends PropsOf<'div'>,
    SeparatorProps,
    IWebbComponentBase {}
