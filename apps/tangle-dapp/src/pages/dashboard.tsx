import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import { useRestakeVaults } from '@tangle-network/tangle-shared-ui/data/restake/useRestakeVaults';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import { FC } from 'react';
import AccountSummaryCard from '../components/account/AccountSummaryCard';
import { ProtocolStatisticCard } from '../components/account/ProtocolStatisticCard';
import { VaultsTable, useVaultsTableProps } from '../components/tables/Vaults';

const DashboardPage: FC = () => {
  const { assets, isLoading: isLoadingAssets } = useRestakeAssets();

  const assetsTvl = useRestakeAssetsTvl();

  const { result: delegatorInfo } = useRestakeDelegatorInfo();

  const vaults = useRestakeVaults({
    assets,
    delegatorInfo,
    assetsTvl,
  });

  const tableProps = useVaultsTableProps({
    delegatorDeposits: delegatorInfo?.deposits,
    assets,
    assetsTvl,
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AccountSummaryCard className="md:max-w-none" />

        <ProtocolStatisticCard />
      </div>

      <Typography variant="h4" fw="bold">
        Restake Vaults
      </Typography>

      <VaultsTable
        data={vaults}
        tableProps={tableProps}
        isLoading={isLoadingAssets}
      />
    </div>
  );
};

export default DashboardPage;
