import { OperatorConcentration } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorConcentration';
import { OperatorTvlGroup } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorTvl';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import { useRestakeVaults } from '@tangle-network/tangle-shared-ui/data/restake/useRestakeVaults';
import type {
  OperatorMap,
  RestakeAsset,
} from '@tangle-network/tangle-shared-ui/types/restake';
import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { TabContent } from '@tangle-network/ui-components/components/Tabs/TabContent';
import { type FC, useCallback, useState } from 'react';
import {
  useVaultsTableProps,
  VaultsTable,
} from '../../components/tables/Vaults';
import { RestakeAction } from '../../constants';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import RestakeDelegateForm from '../../pages/restake/delegate';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import OperatorsTable from './OperatorsTable';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';

enum RestakeTab {
  RESTAKE = 'Restake',
  VAULTS = 'Vaults',
  OPERATORS = 'Operators',
  BLUEPRINTS = 'Blueprints',
}

type Props = {
  operatorConcentration?: OperatorConcentration;
  operatorMap: OperatorMap;
  operatorTVL?: OperatorTvlGroup['operatorTvl'];
  action: RestakeAction;
};

const RestakeOverviewTabs: FC<Props> = ({
  operatorConcentration,
  operatorMap,
  operatorTVL,
  action,
}) => {
  const [tab, setTab] = useState(RestakeTab.RESTAKE);

  const {
    assets,
    isLoading: isLoadingAssets,
    refetchErc20Balances,
  } = useRestakeAssets();

  const handleRestakeClicked = useCallback(() => {
    setTab(RestakeTab.RESTAKE);
  }, []);

  return (
    <TableAndChartTabs
      tabs={Object.values(RestakeTab)}
      value={tab}
      onValueChange={(tab) => setTab(tab as RestakeTab)}
      headerClassName="w-full"
      className="space-y-9"
    >
      <TabContent
        value={RestakeTab.RESTAKE}
        className="flex justify-center md:min-w-[480px] mx-auto"
      >
        {action === RestakeAction.DEPOSIT ? (
          <DepositForm
            assets={assets}
            isLoadingAssets={isLoadingAssets}
            refetchErc20Balances={refetchErc20Balances}
          />
        ) : action === RestakeAction.WITHDRAW ? (
          <RestakeWithdrawForm assets={assets} />
        ) : action === RestakeAction.DELEGATE ? (
          <RestakeDelegateForm assets={assets} />
        ) : action === RestakeAction.UNDELEGATE ? (
          <RestakeUnstakeForm assets={assets} />
        ) : null}
      </TabContent>

      <TabContent value={RestakeTab.VAULTS}>
        <VaultTabContent assets={assets} isLoadingAssets={isLoadingAssets} />
      </TabContent>

      <TabContent value={RestakeTab.OPERATORS}>
        <OperatorsTable
          operatorConcentration={operatorConcentration}
          operatorMap={operatorMap}
          operatorTvl={operatorTVL}
          onRestakeClicked={handleRestakeClicked}
        />
      </TabContent>

      <TabContent value={RestakeTab.BLUEPRINTS}>
        <BlueprintListing />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default RestakeOverviewTabs;

type VaultTabContentProps = {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  isLoadingAssets: boolean;
};

const VaultTabContent = ({ assets, isLoadingAssets }: VaultTabContentProps) => {
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
  });

  return (
    <VaultsTable
      data={vaults}
      tableProps={tableProps}
      isLoading={isLoadingAssets}
    />
  );
};
