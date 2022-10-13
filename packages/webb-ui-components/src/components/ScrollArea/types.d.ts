import { ScrollAreaProps as RdxScrollAreaProps } from '@radix-ui/react-scroll-area';
import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export interface ScrollAreaProps extends Omit<WebbComponentBase, 'dir'>, RdxScrollAreaProps {}
