import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/Typography';
import { FC } from 'react';

import AccountSummaryCard from '../components/account/AccountSummaryCard';
import RestakeBalancesTable from '../containers/RestakeBalancesTable';

const AccountPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <AccountSummaryCard className="max-w-full md:max-w-full" />

      <Typography variant="h4" fw="bold">
        Assets &amp; Balances
      </Typography>

      <RestakeBalancesTable />
    </div>
  );
};

export default AccountPage;
