import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import GlassCard from '../GlassCard';

const UnstakeRequestsTable: FC = () => {
  return (
    <GlassCard>
      <NoUnstakeRequestsNotice />
    </GlassCard>
  );
};

const NoUnstakeRequestsNotice: FC = () => {
  return (
    <div className="flex flex-col items-start justify-center gap-4">
      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        No unstake requests
      </Typography>

      <Typography variant="body2" fw="normal">
        You will be able to claim your tokens after the unstake request has been
        processed. To unstake your tokens go to the unstake tab to schedule
        request.
      </Typography>
    </div>
  );
};

export default UnstakeRequestsTable;
