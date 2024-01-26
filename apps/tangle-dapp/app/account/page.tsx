import { Typography } from '@webb-tools/webb-ui-components';

import { StakingStatsContainer } from '../../containers/StakingStatsContainer';
import AccountSummaryCard from './AccountSummaryCard';
import Actions from './Actions';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6 flex-col md:flex-row">
        <AccountSummaryCard />
      </div>

      <StakingStatsContainer />

      <Actions />

      <Typography variant="h4" fw="bold">
        Manage Balances
      </Typography>

      {/* TODO: Custom balances table here. */}
    </div>
  );
}
