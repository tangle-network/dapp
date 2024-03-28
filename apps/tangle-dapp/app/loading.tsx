import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex gap-6 flex-col xl:flex-row">
        <SkeletonLoader className="rounded-2xl md:max-w-full xl:max-w-[556px] min-h-[274px]" />

        <SkeletonLoader className="rounded-2xl min-h-[170px] xl:min-h-[274px]" />
      </div>

      <Typography variant="h4" fw="bold">
        Manage Balances
      </Typography>

      <SkeletonLoader className="rounded-2xl h-[190px]" />
    </div>
  );
}
