import { FC } from '../../../../../node_modules/react';
import { SkeletonSize } from './types';
export interface SkeletonLoaderProps {
    /**
     * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)
     * @default "md"
     */
    size?: SkeletonSize;
    className?: string;
    as?: 'div' | 'span';
}
declare const SkeletonLoader: FC<SkeletonLoaderProps>;
export default SkeletonLoader;
