import { Spinner } from '@webb-tools/icons';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';

import { GlassCard, TangleCard } from '../../../components';
import ValueSkeleton from './ValueSkeleton';

export default function Loading() {
  return (
    <div className="my-5 space-y-10">
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        <TangleCard className="min-h-[300px]">
          <div className="w-full space-y-9">
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded-full bg-mono-40 dark:bg-mono-160" />
              <div className="space-y-1 flex-1">
                <ValueSkeleton />
                <SkeletonLoader size="lg" className="w-4/5" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-2">
              <div className="flex-1 space-y-3">
                <Typography variant="h5" fw="bold" className="!text-mono-100">
                  Total Restaked
                </Typography>
                <ValueSkeleton />
              </div>
              <div className="flex-1 space-y-3">
                <Typography variant="h5" fw="bold" className="!text-mono-100">
                  Nominations
                </Typography>
                <ValueSkeleton />
              </div>
            </div>
          </div>
        </TangleCard>
        <GlassCard>
          <Typography variant="h5" fw="bold">
            Role Distribution
          </Typography>
          <div className="min-h-[200px] flex items-center justify-center">
            <Spinner size="xl" />
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <Typography variant="h5" fw="bold">
          Node Specifications
        </Typography>
        <SkeletonLoader className="h-[120px] rounded-2xl" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Typography variant="h5" fw="bold">
            Active Services
          </Typography>
          <Typography variant="h5" fw="bold" className="!text-mono-100">
            Past Services
          </Typography>
        </div>
        <SkeletonLoader className="h-[228px] rounded-2xl" />
      </div>
    </div>
  );
}
