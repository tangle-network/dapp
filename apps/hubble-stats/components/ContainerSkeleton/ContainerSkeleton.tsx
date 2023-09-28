import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonLoader } from '@webb-tools/webb-ui-components';

import { ContainerSkeletonProps } from './types';

const ContainerSkeleton: FC<ContainerSkeletonProps> = ({
  numOfRows = 2,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'rounded-lg border border-mono-40 dark:border-mono-160',
        'bg-glass dark:bg-glass_dark px-6 py-5',
        'flex flex-col gap-5',
        className
      )}
    >
      {[...Array(numOfRows)].map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
};

export default ContainerSkeleton;

const SkeletonRow: FC = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <SkeletonLoader size="xl" />
      <SkeletonLoader size="xl" />
    </div>
  );
};
