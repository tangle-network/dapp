import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { getSkeletonClassNamesBySize } from './utils';
import type { SkeletonLoaderProps } from './types';

const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  size = 'md',
  className,
}) => {
  const baseClassNames =
    'animate-pulse bg-slate-200 dark:bg-mono-160 w-full rounded-md';

  const classNames = twMerge(
    baseClassNames,
    getSkeletonClassNamesBySize(size),
    className,
  );
  return <div className={classNames} />;
};

export default SkeletonLoader;
