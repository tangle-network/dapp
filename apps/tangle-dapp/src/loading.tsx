import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import type { FC } from 'react';

const LoadingPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-6 xl:flex-row">
        <SkeletonLoader className="rounded-2xl md:max-w-full xl:max-w-[556px] min-h-[274px]" />

        <SkeletonLoader className="rounded-2xl min-h-[170px] xl:min-h-[274px]" />
      </div>

      <SkeletonLoader className="rounded-2xl min-h-[40px] max-w-[130px]" />

      <SkeletonLoader className="rounded-2xl h-[190px]" />
    </div>
  );
};

export default LoadingPage;
