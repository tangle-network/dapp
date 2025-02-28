import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { PlayFillIcon, TimeLineIcon } from '@tangle-network/icons';
import { ReactElement, useState } from 'react';
import { TabContent } from '@tangle-network/ui-components';
import { TrashIcon } from '@radix-ui/react-icons';
import { twMerge } from 'tailwind-merge';
import { RunningInstanceTable } from './RunningInstanceTable';
import { PendingInstanceTable } from './PendingInstanceTable';
import { StoppedInstanceTable } from './StoppedInstanceTable';
enum EInstancesTab {
  RUNNING_INSTANCES = 'Running',
  PENDING_INSTANCES = 'Pending',
  HISTORY_INSTANCES = 'History',
}

const InstancesTab: string[] = Object.values(EInstancesTab);

const InstancesTabIcon: ReactElement[] = [
  <PlayFillIcon viewBox='0 0 16 16' className="w-4 h-4 !fill-blue-50" />,
  <TimeLineIcon className="w-4 h-4 !fill-yellow-100" />,
  <TrashIcon className="w-4 h-4  [&>path]:fill-red-100" />,
] as const;

export const InstancesTabs = () => {
  const [selectedTab, setSelectedTab] = useState(
    EInstancesTab.RUNNING_INSTANCES,
  );

  return (
    <TableAndChartTabs
      tabs={InstancesTab}
      icons={InstancesTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as EInstancesTab)}
      className="space-y-9 w-full"
      triggerClassName={twMerge(
        'border-b-2 py-4 aria-selected:border-blue-50',
        '[&>*]:opacity-50 [&[aria-selected="true"]>*]:opacity-100',
      )}
      enableAdvancedDivider
    >
      <TabContent
        value={EInstancesTab.RUNNING_INSTANCES}
        className="flex justify-center mx-auto"
      >
        <RunningInstanceTable />
      </TabContent>

      <TabContent
        value={EInstancesTab.PENDING_INSTANCES}
        className="flex justify-center mx-auto"
      >
        <PendingInstanceTable />
      </TabContent>

      <TabContent
        value={EInstancesTab.HISTORY_INSTANCES}
        className="flex justify-center mx-auto"
      >
        <StoppedInstanceTable />
      </TabContent>
    </TableAndChartTabs>
  );
};
