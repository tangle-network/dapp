import { Typography } from '@webb-tools/webb-ui-components';

import { StakingStatsContainer } from '../../containers/StakingStatsContainer';
import AccountSummaryCard from './AccountSummaryCard';
import Actions from './Actions';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6">
        <AccountSummaryCard />

        <Actions />
      </div>

      <StakingStatsContainer />

      <Typography variant="h4" fw="bold">
        Manage Balances
      </Typography>

      {/* TODO: Notes table here. */}
    </div>
  );
}
