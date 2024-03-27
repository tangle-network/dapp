import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const KeyStatsContainerLoading: FC = () => {
  return (
    <div
      className={twMerge(
        'w-full rounded-lg overflow-hidden',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160'
      )}
    >
      <div
        className={twMerge(
          'grid gap-1 grid-cols-2 lg:grid-cols-5',
          '[&>div]:border-r [&>div]:border-r-mono-40 [&>div]:dark:border-r-mono-160',
          '[&>div]:even:border-none',
          'lg:[&>div]:even:border-r',
          '[&>div]:border-b [&>div]:border-b-mono-40 [&>div]:dark:border-b-mono-160',
          'lg:[&>div]:nth-last-child(-n+5):border-b-0',
          '[&>div]:nth-last-child(-n+2):border-b-0'
        )}
      >
        <KeyStatsItemLoading className="col-span-2 lg:col-span-1 lg:!border-b-0" />
        <KeyStatsItemLoading className="lg:!border-b-0" />
        <KeyStatsItemLoading className="lg:!border-b-0" />
        <KeyStatsItemLoading className="lg:!border-b-0" />
        <KeyStatsItemLoading className="lg:!border-b-0 lg:!border-r-0" />
      </div>
    </div>
  );
};

export default KeyStatsContainerLoading;

const KeyStatsItemLoading: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={twMerge('px-2 py-2 space-y-2 md:px-2 lg:px-4', className)}>
      <SkeletonLoader className="w-3/4" />
      <SkeletonLoader size="lg" />
    </div>
  );
};
