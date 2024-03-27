import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import ContainerSkeleton from '../../components/skeleton/ContainerSkeleton';
import KeyStatsContainerLoading from '../../containers/KeyStatsContainer/KeyStatsContainerLoading';
import NominatorStatsContainerLoading from '../../containers/NominatorStatsContainer/NominatorStatsContainerLoading';

export default function Loading() {
  return (
    <div className="space-y-12">
      <Typography variant="h4" fw="bold">
        Overview
      </Typography>

      <KeyStatsContainerLoading />

      <NominatorStatsContainerLoading />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Typography variant="h5" fw="bold">
            Nominations
          </Typography>

          <Typography variant="h5" fw="bold" className="text-mono-100">
            Payouts
          </Typography>
        </div>

        <ContainerSkeleton />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Typography variant="h5" fw="bold">
            Active Validators
          </Typography>
          <Typography variant="h5" fw="bold" className="text-mono-100">
            Waiting
          </Typography>
        </div>

        <ContainerSkeleton />
      </div>
    </div>
  );
}
