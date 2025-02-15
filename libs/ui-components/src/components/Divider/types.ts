import type { SeparatorProps } from '@radix-ui/react-separator';
import type { IComponentBase, PropsOf } from '../../types';

export interface DividerProps
  extends PropsOf<'div'>,
    SeparatorProps,
    IComponentBase {}
