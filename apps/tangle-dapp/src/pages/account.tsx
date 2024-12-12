import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/Typography';
import { FC } from 'react';

import AccountSummaryCard from '../components/account/AccountSummaryCard';
import BalancesTableContainer from '../containers/BalancesTableContainer/BalancesTableContainer';

const AccountPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <AccountSummaryCard className="max-w-full md:max-w-full" />

      <Typography variant="h4" fw="bold">
        Balances
      </Typography>

      <BalancesTableContainer />
    </div>
  );
};

export default AccountPage;
