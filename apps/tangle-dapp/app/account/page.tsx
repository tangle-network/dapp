import { Typography } from '@webb-tools/webb-ui-components';

import BalancesTableContainer from '../../containers/BalancesTableContainer/BalancesTableContainer';
import RecentTxContainer from '../../containers/RecentTxContainer/RecentTxContainer';
import { StakingStatsContainer } from '../../containers/StakingStatsContainer';
import AccountSummaryCard from './AccountSummaryCard';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6 flex-col md:flex-row">
        <AccountSummaryCard />

        <RecentTxContainer />
      </div>

      {/* <StakingStatsContainer /> */}

      <Typography variant="h4" fw="bold">
        Manage Balances
      </Typography>

      <BalancesTableContainer />
    </div>
  );
}
