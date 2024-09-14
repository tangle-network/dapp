import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type SkeletonLoaderSetProps = {
  rowCount?: number;
  className?: string;
};

const TableRowsSkeleton: FC<SkeletonLoaderSetProps> = ({
  rowCount = 10,
  className,
}) => {
  return (
    <div className={twMerge('flex flex-col gap-2 w-full')}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <SkeletonLoader
          key={index}
          className={twMerge('h-7 w-full', className)}
        />
      ))}
    </div>
  );
};

export default TableRowsSkeleton;
