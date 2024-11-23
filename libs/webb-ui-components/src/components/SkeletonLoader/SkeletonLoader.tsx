import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { getSkeletonClassNamesBySize } from './utils';
import type { SkeletonLoaderProps } from './types';

const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  size = 'md',
  className,
}) => {
  return (
    <div
      className={twMerge(
        'animate-pulse bg-mono-20 dark:bg-mono-160 w-full rounded-md',
        getSkeletonClassNamesBySize(size),
        className,
      )}
    />
  );
};

export default SkeletonLoader;
