import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import { FC } from 'react';
import AccountSummaryCard from '../components/account/AccountSummaryCard';
import { ProtocolStatisticCard } from '../components/account/ProtocolStatisticCard';
import VaultsOverview from '../containers/restaking/VaultsOverview';

const DashboardPage: FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AccountSummaryCard className="md:max-w-none" />

        <ProtocolStatisticCard />
      </div>

      <Typography variant="h4" fw="bold">
        Restake Vaults
      </Typography>

      <VaultsOverview />
    </div>
  );
};

export default DashboardPage;
