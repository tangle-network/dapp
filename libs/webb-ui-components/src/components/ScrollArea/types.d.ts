import { ScrollAreaProps as RdxScrollAreaProps } from '@radix-ui/react-scroll-area';
import { WebbComponentBase } from '../../types';

export interface ScrollAreaProps
  extends Omit<WebbComponentBase, 'dir'>,
    RdxScrollAreaProps {}
