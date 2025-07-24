import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { PlayFillIcon, TimeLineIcon } from '@tangle-network/icons';
import { FC, ReactElement, useState, Dispatch, SetStateAction, useMemo } from 'react';
import { TabContent } from '@tangle-network/ui-components';
import { RunningInstanceTable } from './RunningInstanceTable';
import { PendingInstanceTable } from './PendingInstanceTable';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import { useOperatorStatsData } from '../../../data/operators/useOperatorStatsData';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import { isSubstrateAddress } from '@tangle-network/ui-components';

enum InstancesTab {
  RUNNING_INSTANCES = 'Running',
  PENDING_INSTANCES = 'Pending',
}

const InstancesTabIcon: ReactElement[] = [
  <PlayFillIcon viewBox="0 0 16 16" className="w-4 h-4 !fill-blue-50" />,
  <TimeLineIcon className="w-4 h-4 !fill-yellow-100" />,
] as const;

interface InstancesTabsProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const InstancesTabs: FC<InstancesTabsProps> = ({
  refreshTrigger,
  setRefreshTrigger,
}) => {
  const { isOperator } = useOperatorInfo();
  const accountAddress = useActiveAccountAddress();

  const { result: operatorStatsData } = useOperatorStatsData(
    useMemo(() => {
      if (
        !accountAddress ||
        !isOperator ||
        !isSubstrateAddress(accountAddress)
      ) {
        return null;
      }

      return accountAddress;
    }, [accountAddress, isOperator]),
    refreshTrigger,
  );

  const hasRegisteredBlueprints = useMemo(() => {
    return operatorStatsData && operatorStatsData.registeredBlueprints > 0;
  }, [operatorStatsData]);

  const shouldShowPendingTab = isOperator && hasRegisteredBlueprints;

  const availableTabs = shouldShowPendingTab
    ? Object.values(InstancesTab)
    : [InstancesTab.RUNNING_INSTANCES];

  const availableIcons = shouldShowPendingTab
    ? InstancesTabIcon
    : [InstancesTabIcon[0]];

  const [selectedTab, setSelectedTab] = useState(
    InstancesTab.RUNNING_INSTANCES,
  );

  return (
    <TableAndChartTabs
      tabs={availableTabs}
      icons={availableIcons}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as InstancesTab)}
      className="space-y-9 w-full"
      enableAdvancedDivider
    >
      <TabContent
        value={InstancesTab.RUNNING_INSTANCES}
        className="flex justify-center mx-auto"
      >
        <RunningInstanceTable
          refreshTrigger={refreshTrigger}
          setRefreshTrigger={setRefreshTrigger}
        />
      </TabContent>

      {shouldShowPendingTab && (
        <TabContent
          value={InstancesTab.PENDING_INSTANCES}
          className="flex justify-center mx-auto"
        >
          <PendingInstanceTable
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
        </TabContent>
      )}
    </TableAndChartTabs>
  );
};
