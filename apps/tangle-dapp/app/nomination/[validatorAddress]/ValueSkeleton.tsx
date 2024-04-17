import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const ValueSkeleton: FC<{ className?: string }> = ({ className }) => {
  return (
    <SkeletonLoader size="lg" className={twMerge('h-8 w-3/5', className)} />
  );
};

export default ValueSkeleton;
