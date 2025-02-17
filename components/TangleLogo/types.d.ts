import { IconBase } from '../../../../icons/src/types';
/**
 * The Tangle Logo props
 */
export interface TangleLogoProps extends Omit<IconBase, 'size'> {
    /**
     * The logo size
     * @default "md"
     */
    size?: 'sm' | 'md' | 'lg';
}
