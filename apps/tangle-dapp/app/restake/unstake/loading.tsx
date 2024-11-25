import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

const LoadingPage: FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <SkeletonLoader className="w-full mb-4 h-11 rounded-xl" />

      <SkeletonLoader className="w-full h-36 rounded-xl" />
    </div>
  );
};

export default LoadingPage;
