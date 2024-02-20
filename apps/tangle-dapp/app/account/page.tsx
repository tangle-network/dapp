import { Typography } from '@webb-tools/webb-ui-components';

import BalancesTableContainer from '../../containers/BalancesTableContainer/BalancesTableContainer';
import RecentTxContainer from '../../containers/RecentTxContainer/RecentTxContainer';
import AccountSummaryCard from './AccountSummaryCard';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6 flex-col xl:flex-row">
        <AccountSummaryCard className="md:max-w-full xl:max-w-[556px]" />

        <RecentTxContainer />
      </div>

      <Typography variant="h4" fw="bold">
        Manage Balances
      </Typography>

      <BalancesTableContainer />
    </div>
  );
}
