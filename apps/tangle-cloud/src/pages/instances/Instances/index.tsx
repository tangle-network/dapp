import {
  PlayFillIcon,
  TimeLineIcon,
  CheckboxCircleLine,
  GlobalLine,
} from '@tangle-network/icons';
import { FC, useState, Dispatch, SetStateAction, useMemo } from 'react';
import { RunningInstanceTable } from './RunningInstanceTable';
import { PendingInstanceTable } from './PendingInstanceTable';
import { ApprovedInstanceTable } from './ApprovedInstanceTable';
import { AllServicesTable } from './AllServicesTable';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import useOperatorStats from '../../../data/operators/useOperatorStats';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tangle-network/sandbox-ui/primitives';

enum InstancesTab {
  RUNNING_INSTANCES = 'Running',
  PENDING_INSTANCES = 'Pending',
  APPROVED_INSTANCES = 'Approved',
  JOINABLE_SERVICES = 'Joinable',
}

const tabIcons = {
  [InstancesTab.RUNNING_INSTANCES]: (
    <PlayFillIcon className="h-4 w-4 fill-current" />
  ),
  [InstancesTab.PENDING_INSTANCES]: (
    <TimeLineIcon className="h-4 w-4 fill-current" />
  ),
  [InstancesTab.APPROVED_INSTANCES]: (
    <CheckboxCircleLine className="h-4 w-4 fill-current" />
  ),
  [InstancesTab.JOINABLE_SERVICES]: (
    <GlobalLine className="h-4 w-4 fill-current" />
  ),
} as const;

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

  const [selectedTab, setSelectedTab] = useState(
    InstancesTab.RUNNING_INSTANCES,
  );

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(tab: string) => setSelectedTab(tab as InstancesTab)}
      className="w-full space-y-5"
    >
      <TabsList className="flex w-full flex-wrap gap-1 rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 p-1">
        {availableTabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-mono-100 dark:text-mono-60 transition-colors data-[state=active]:bg-mono-0 data-[state=active]:text-mono-200 dark:data-[state=active]:bg-mono-180 dark:data-[state=active]:text-mono-0"
          >
            {tabIcons[tab]}
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={InstancesTab.RUNNING_INSTANCES} className="w-full">
        <RunningInstanceTable />
      </TabsContent>

      {shouldShowOperatorTabs && (
        <TabsContent value={InstancesTab.PENDING_INSTANCES} className="w-full">
          <PendingInstanceTable
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
        </TabsContent>
      )}

      {shouldShowOperatorTabs && (
        <TabsContent value={InstancesTab.APPROVED_INSTANCES} className="w-full">
          <ApprovedInstanceTable
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
        </TabsContent>
      )}

      <TabsContent value={InstancesTab.JOINABLE_SERVICES} className="w-full">
        <AllServicesTable />
      </TabsContent>
    </Tabs>
  );
};
