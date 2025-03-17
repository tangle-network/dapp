import type { OperatorMap } from '@tangle-network/tangle-shared-ui/types/restake';
import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { TabContent } from '@tangle-network/ui-components/components/Tabs/TabContent';
import { type FC, ReactNode, useCallback, useState } from 'react';
import { RestakeAction } from '../../constants';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import RestakeDelegateForm from '../../pages/restake/delegate';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import OperatorsTable from './OperatorsTable';
import VaultsOverview from './VaultsOverview';
import { OperatorConcentration } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorConcentration';
import { OperatorTVLType } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorTVL';

enum RestakeTab {
  RESTAKE = 'Restake',
  VAULTS = 'Vaults',
  OPERATORS = 'Operators',
  BLUEPRINTS = 'Blueprints',
}

type Props = {
  operatorConcentration?: OperatorConcentration;
  operatorMap: OperatorMap;
  operatorTVL?: OperatorTVLType['operatorTVL'];
  action: RestakeAction;
};

const getFormOfRestakeAction = (action: RestakeAction): ReactNode => {
  switch (action) {
    case RestakeAction.DEPOSIT:
      return <DepositForm />;
    case RestakeAction.WITHDRAW:
      return <RestakeWithdrawForm />;
    case RestakeAction.DELEGATE:
      return <RestakeDelegateForm />;
    case RestakeAction.UNDELEGATE:
      return <RestakeUnstakeForm />;
  }
};

const RestakeOverviewTabs: FC<Props> = ({
  operatorConcentration,
  operatorMap,
  operatorTVL,
  action,
}) => {
  const [tab, setTab] = useState(RestakeTab.RESTAKE);

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
        {getFormOfRestakeAction(action)}
      </TabContent>

      <TabContent value={RestakeTab.VAULTS}>
        <VaultsOverview />
      </TabContent>

      <TabContent value={RestakeTab.OPERATORS}>
        <OperatorsTable
          operatorConcentration={operatorConcentration}
          operatorMap={operatorMap}
          operatorTVL={operatorTVL}
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
