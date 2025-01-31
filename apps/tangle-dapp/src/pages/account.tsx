import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/Typography';
import { FC } from 'react';

import AccountSummaryCard from '../components/account/AccountSummaryCard';
import VaultsAndBalancesTable from '../containers/VaultsAndBalancesTable';
import PromotionalBanner from '../components/account/PromotionalBanner';

const AccountPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSummaryCard className="flex-1 md:max-w-none" />

        <PromotionalBanner className="flex-1" />
      </div>

      <Typography variant="h4" fw="bold">
        Restake Assets
      </Typography>

      <VaultsAndBalancesTable />
    </div>
  );
};

export default AccountPage;
