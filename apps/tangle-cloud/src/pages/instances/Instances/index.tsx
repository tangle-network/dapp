import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { PlayFillIcon, TimeLineIcon } from '@tangle-network/icons';
import { FC, ReactElement, useState } from 'react';
import { TabContent } from '@tangle-network/ui-components';
import { TrashIcon } from '@radix-ui/react-icons';
import { twMerge } from 'tailwind-merge';
import { RunningInstanceTable } from './RunningInstanceTable';
import { PendingInstanceTable } from './PendingInstanceTable';
import { StoppedInstanceTable } from './StoppedInstanceTable';
import { InstancesTabsProps } from './type';

enum InstancesTab {
  RUNNING_INSTANCES = 'Running',
  PENDING_INSTANCES = 'Pending',
  HISTORY_INSTANCES = 'History',
}

const InstancesTabIcon: ReactElement[] = [
  <PlayFillIcon viewBox="0 0 16 16" className="w-4 h-4 !fill-blue-50" />,
  <TimeLineIcon className="w-4 h-4 !fill-yellow-100" />,
  <TrashIcon className="w-4 h-4  [&>path]:fill-red-100" />,
] as const;

export const InstancesTabs: FC<InstancesTabsProps> = ({
  runningInstances,
  pendingInstances,
  stoppedInstances,
}) => {
  const [selectedTab, setSelectedTab] = useState(
    InstancesTab.RUNNING_INSTANCES,
  );

  return (
    <TableAndChartTabs
      tabs={Object.values(InstancesTab)}
      icons={InstancesTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as InstancesTab)}
      className="space-y-9 w-full"
      triggerClassName={twMerge(
        'border-b-2 py-4 aria-selected:border-blue-50',
        '[&>*]:opacity-50 [&[aria-selected="true"]>*]:opacity-100',
      )}
      enableAdvancedDivider
    >
      <TabContent
        value={InstancesTab.RUNNING_INSTANCES}
        className="flex justify-center mx-auto"
      >
        <RunningInstanceTable {...runningInstances} />
      </TabContent>

      <TabContent
        value={InstancesTab.PENDING_INSTANCES}
        className="flex justify-center mx-auto"
      >
        <PendingInstanceTable {...pendingInstances} />
      </TabContent>

      <TabContent
        value={InstancesTab.HISTORY_INSTANCES}
        className="flex justify-center mx-auto"
      >
        <StoppedInstanceTable {...stoppedInstances} />
      </TabContent>
    </TableAndChartTabs>
  );
};
