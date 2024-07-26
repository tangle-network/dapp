import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type SkeletonLoaderSetProps = {
  count: number;
  className?: string;
  isVerticalDirection?: boolean;
};

const SkeletonLoaderSet: FC<SkeletonLoaderSetProps> = ({
  count,
  className,
  isVerticalDirection = true,
}) => {
  return (
    <div
      className={twMerge(
        'flex gap-2 w-full',
        isVerticalDirection ? 'flex-col' : 'flex-row',
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader
          key={index}
          className={twMerge('h-7 w-full', className)}
        />
      ))}
    </div>
  );
};

export default SkeletonLoaderSet;
