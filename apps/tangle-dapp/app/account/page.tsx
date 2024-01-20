import { Typography } from '@webb-tools/webb-ui-components';

import AccountSummaryCard from './AccountSummaryCard';
import Actions from './Actions';
import StakingDashboard from './StakingDashboard';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6">
        <AccountSummaryCard />

        <Actions />
      </div>

      <StakingDashboard />

      <Typography variant="h4" fw="bold">
        Manage Balances
      </Typography>

      {/* TODO: Notes table here. */}
    </div>
  );
}
