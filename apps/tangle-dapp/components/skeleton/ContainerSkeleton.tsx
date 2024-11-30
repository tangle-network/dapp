import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

import SkeletonRow from './SkeletonRow';

export interface ContainerSkeletonProps {
  numOfRows?: number;
  className?: string;
}

const ContainerSkeleton: FC<ContainerSkeletonProps> = ({
  numOfRows = 4,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'rounded-lg border border-mono-40 dark:border-mono-160',
        'bg-glass dark:bg-glass_dark px-6 py-5',
        'flex flex-col gap-1.5',
        className,
      )}
    >
      {[...Array(numOfRows)].map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
};

export default ContainerSkeleton;
