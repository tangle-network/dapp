import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { Metadata } from 'next';
import { FC, Suspense } from 'react';

import AccountSummaryCard from '../components/account/AccountSummaryCard';
import BalancesTableContainer from '../containers/BalancesTableContainer/BalancesTableContainer';
import RecentTxContainer from '../containers/RecentTxContainer/RecentTxContainer';
import createPageMetadata from '../utils/createPageMetadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Account',
  isHomepage: true,
});

const AccountPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6 flex-col xl:flex-row">
        <Suspense
          fallback={
            <SkeletonLoader className="rounded-2xl md:max-w-full xl:max-w-[556px] min-h-[274px]" />
          }
        >
          <AccountSummaryCard className="md:max-w-full xl:max-w-[556px]" />
        </Suspense>

        <Suspense
          fallback={
            <SkeletonLoader className="rounded-2xl min-h-[170px] xl:min-h-[274px]" />
          }
        >
          <RecentTxContainer />
        </Suspense>
      </div>

      <Typography variant="h4" fw="bold">
        Manage Balances
      </Typography>

      <Suspense fallback={<SkeletonLoader className="rounded-2xl h-[190px]" />}>
        <BalancesTableContainer />
      </Suspense>
    </div>
  );
};

export default AccountPage;
