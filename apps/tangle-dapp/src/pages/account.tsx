import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/Typography';
import { FC } from 'react';

import AccountSummaryCard from '../components/account/AccountSummaryCard';
import PromotionalBanner from '../components/account/PromotionalBanner';
import VaultsOverview from '../containers/restaking/VaultsOverview';

const AccountPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-6 lg:flex-row">
        <AccountSummaryCard className="flex-1 md:max-w-none" />

        <PromotionalBanner className="flex-1" />
      </div>

      <Typography variant="h4" fw="bold">
        Restake Vaults
      </Typography>

      <VaultsOverview />
    </div>
  );
};

export default AccountPage;
