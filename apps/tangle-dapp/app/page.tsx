import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/Typography';
import { Metadata } from 'next';
import { FC } from 'react';

import AccountSummaryCard from '../components/account/AccountSummaryCard';
import BalancesTableContainer from '../containers/BalancesTableContainer/BalancesTableContainer';
import RecentTxContainer from '../containers/RecentTxContainer/RecentTxContainer';
import createPageMetadata from '../utils/createPageMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Account',
  isHomepage: true,
});

const AccountPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-6 xl:flex-row">
        <AccountSummaryCard className="md:max-w-full xl:max-w-[556px]" />

        <RecentTxContainer />
      </div>

      <Typography variant="h4" fw="bold">
        Balances
      </Typography>

      <BalancesTableContainer />
    </div>
  );
};

export default AccountPage;
