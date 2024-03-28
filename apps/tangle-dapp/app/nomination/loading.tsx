import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

export default function Loading() {
  return (
    <div className="space-y-12">
      <Typography variant="h4" fw="bold">
        Overview
      </Typography>

      <SkeletonLoader className="h-[84px]" />

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <SkeletonLoader className="rounded-2xl h-[204px]" />
        <SkeletonLoader className="rounded-2xl h-[204px]" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <Typography variant="h5" fw="bold">
            Nominations
          </Typography>
          <Typography variant="h5" fw="bold" className="!text-mono-100">
            Payouts
          </Typography>
        </div>
        <SkeletonLoader className="h-[228px]" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <Typography variant="h5" fw="bold">
            Active Validators
          </Typography>
          <Typography variant="h5" fw="bold" className="!text-mono-100">
            Waiting
          </Typography>
        </div>
        <SkeletonLoader className="h-[228px]" />
      </div>
    </div>
  );
}
