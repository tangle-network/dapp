import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import {
  PlayFillIcon,
  TimeLineIcon,
  CheckboxCircleLine,
  GlobalLine,
} from '@tangle-network/icons';
import {
  FC,
  ReactElement,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react';
import { TabContent } from '@tangle-network/ui-components';
import { RunningInstanceTable } from './RunningInstanceTable';
import { PendingInstanceTable } from './PendingInstanceTable';
import { ApprovedInstanceTable } from './ApprovedInstanceTable';
import { AllServicesTable } from './AllServicesTable';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import useOperatorStats from '../../../data/operators/useOperatorStats';

enum InstancesTab {
  RUNNING_INSTANCES = 'Running',
  PENDING_INSTANCES = 'Pending',
  APPROVED_INSTANCES = 'Approved',
  JOINABLE_SERVICES = 'Joinable',
}

const InstancesTabIcon: ReactElement[] = [
  <PlayFillIcon viewBox="0 0 16 16" className="w-4 h-4 !fill-blue-50" />,
  <TimeLineIcon className="w-4 h-4 !fill-yellow-100" />,
  <CheckboxCircleLine className="w-4 h-4 !fill-green-50" />,
  <GlobalLine className="w-4 h-4 !fill-purple-50" />,
] as const;

interface InstancesTabsProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const InstancesTabs: FC<InstancesTabsProps> = ({
  refreshTrigger,
  setRefreshTrigger,
}) => {
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  const { result: operatorStatsData } = useOperatorStats(
    isOperator ? (operatorAddress ?? undefined) : undefined,
    refreshTrigger,
  );

  const hasRegisteredBlueprints = useMemo(() => {
    return operatorStatsData && operatorStatsData.registeredBlueprints > 0;
  }, [operatorStatsData]);

  const shouldShowOperatorTabs = isOperator && hasRegisteredBlueprints;

  const availableTabs = shouldShowOperatorTabs
    ? Object.values(InstancesTab)
    : [InstancesTab.RUNNING_INSTANCES, InstancesTab.JOINABLE_SERVICES];

  const availableIcons = shouldShowOperatorTabs
    ? InstancesTabIcon
    : [InstancesTabIcon[0], InstancesTabIcon[3]];

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

      {shouldShowOperatorTabs && (
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

      {shouldShowOperatorTabs && (
        <TabContent
          value={InstancesTab.APPROVED_INSTANCES}
          className="flex justify-center mx-auto"
        >
          <ApprovedInstanceTable
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
        </TabContent>
      )}

      <TabContent
        value={InstancesTab.JOINABLE_SERVICES}
        className="flex justify-center mx-auto"
      >
        <AllServicesTable />
      </TabContent>
    </TableAndChartTabs>
  );
};
