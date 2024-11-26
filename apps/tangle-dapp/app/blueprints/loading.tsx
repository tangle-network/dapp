import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const LoadingPage: FC = () => {
  return (
    <div className="space-y-5">
      <TopBanner />

      <div
        className={twMerge(
          'grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonLoader key={idx} className="h-80" />
        ))}
      </div>
    </div>
  );
};

export default LoadingPage;
