import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import type { FC } from 'react';

const LoadingPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonLoader className="rounded-2xl min-h-[170px] xl:min-h-[274px]" />

      <SkeletonLoader className="w-56 rounded-2xl h-9" />

      <SkeletonLoader className="rounded-2xl h-[190px]" />
    </div>
  );
};

export default LoadingPage;
