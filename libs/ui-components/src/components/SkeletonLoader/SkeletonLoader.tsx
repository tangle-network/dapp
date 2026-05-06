import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonSize } from './types';
import { getHeightBySize } from './utils';

export interface SkeletonLoaderProps {
  /**
   * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)
   * @default "md"
   */
  size?: SkeletonSize;

  className?: string;

  as?: 'div' | 'span';
}

const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  size = 'md',
  className,
  as = 'div',
}) => {
  const Component = as;

  return (
    <Component
      className={twMerge(
        'animate-pulse bg-mono-20 dark:bg-mono-160 w-full rounded-md',
        getHeightBySize(size),
        className,
      )}
    />
  );
};

export default SkeletonLoader;
