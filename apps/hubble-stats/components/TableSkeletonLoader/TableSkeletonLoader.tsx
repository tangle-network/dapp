import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonLoader } from '@webb-tools/webb-ui-components';

const TableSkeletonLoader: FC = () => {
  return (
    <div
      className={twMerge(
        'rounded-lg bg-mono-0 dark:bg-mono-180 border border-mono-40 dark:border-mono-160',
        'flex flex-col gap-5',
        'px-6 py-5'
      )}
    >
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
};

export default TableSkeletonLoader;

const SkeletonRow: FC = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <SkeletonLoader size="xl" />
      <SkeletonLoader size="xl" />
    </div>
  );
};
