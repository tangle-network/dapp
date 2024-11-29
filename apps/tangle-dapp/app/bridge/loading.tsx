import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Label } from '@webb-tools/webb-ui-components/components/Label';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

const Loading: FC = () => {
  // TODO: Using the container style when PR https://github.com/tangle-network/dapp/pull/2664 is merged
  return (
    <div
      className={twMerge(
        'max-w-[640px] min-h-[580px] bg-mono-0 dark:bg-mono-190 p-5 md:p-8 rounded-xl',
        'shadow-webb-lg dark:shadow-webb-lg-dark',
        'flex flex-col justify-between w-full mx-auto',
      )}
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-center justify-center md:flex-row md:justify-between md:items-end md:gap-3">
          {/* Source Chain Selector */}
          <div className="w-full space-y-2 md:flex-1">
            <Label
              className="font-bold text-mono-120 dark:text-mono-120"
              htmlFor="bridge-source-chain-selector"
            >
              From
            </Label>

            <SkeletonLoader className="w-full h-16" />
          </div>

          <ArrowRight
            size="lg"
            className="mt-5 rotate-90 md:rotate-0 md:mt-0 md:mb-5"
          />

          {/* Destination Chain Selector */}
          <div className="w-full space-y-2 md:flex-1">
            <Label
              className="font-bold text-mono-120 dark:text-mono-120"
              htmlFor="bridge-destination-chain-selector"
            >
              To
            </Label>

            <SkeletonLoader className="w-full h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <SkeletonLoader className="w-full h-[72px]" />

          <SkeletonLoader className="w-full h-4 ml-auto max-w-24" />
        </div>

        <SkeletonLoader className="w-full h-[72px]" />
      </div>

      <Button isFullWidth isLoading loadingText="Loading..." />
    </div>
  );
};

export default Loading;
