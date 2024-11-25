import { ArrowDownIcon } from '@webb-tools/icons/ArrowDownIcon';
import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

const LoadingPage: FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <SkeletonLoader className="w-full mb-4 h-11 rounded-xl" />

      <div className="space-y-2">
        <SkeletonLoader className="w-full h-36 rounded-xl" />

        <ArrowDownIcon size="lg" className="mx-auto" />

        <SkeletonLoader className="w-full h-36 rounded-xl" />
      </div>
    </div>
  );
};

export default LoadingPage;
