import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import type { FC } from 'react';

const LoadingPage: FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <SkeletonLoader className="w-full h-11 rounded-2xl" />

      <SkeletonLoader className="w-full h-[448px] rounded-2xl" />
    </div>
  );
};

export default LoadingPage;
