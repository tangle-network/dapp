import { Divider } from '@webb-tools/webb-ui-components/components/Divider';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { twMerge } from 'tailwind-merge';

const NominatorStatsContainerLoading = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div
        className={twMerge(
          'w-full rounded-2xl overflow-hidden h-min-[204px] p-4',
          'bg-glass dark:bg-glass_dark',
          'border-2 border-mono-0 dark:border-mono-160'
        )}
      >
        <div className="space-y-4">
          <SkeletonLoader size="lg" />
          <SkeletonLoader />
        </div>

        <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

        <SkeletonLoader size="lg" />
      </div>

      <div
        className={twMerge(
          'w-full rounded-2xl overflow-hidden h-min-[204px] p-4',
          'bg-glass dark:bg-glass_dark',
          'border-2 border-mono-0 dark:border-mono-160'
        )}
      >
        <div className="space-y-4">
          <SkeletonLoader size="lg" />
          <SkeletonLoader />
        </div>

        <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

        <SkeletonLoader size="lg" />
      </div>
    </div>
  );
};

export default NominatorStatsContainerLoading;
