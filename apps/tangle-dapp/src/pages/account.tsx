import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/Typography';
import { FC } from 'react';

import AccountSummaryCard from '../components/account/AccountSummaryCard';
import AssetsAndBalancesTable from '../containers/AssetsAndBalancesTable';
import PointsReminder from '../components/account/PointsReminder';

const AccountPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6">
        <AccountSummaryCard className="flex-1 max-w-full" />

        <PointsReminder className="flex-1" />
      </div>

      <Typography variant="h4" fw="bold">
        Assets &amp; Balances
      </Typography>

      <AssetsAndBalancesTable />
    </div>
  );
};

export default AccountPage;
