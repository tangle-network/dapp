import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { LockFillIcon } from '@tangle-network/icons';
import { ReactElement, useState } from 'react';
import { TabContent } from '@tangle-network/ui-components';
import { TvlTable } from './tvlTable';  

enum ETvlTab {
  TVL = 'Total Value Locked',
}

const TvlTab: string[] = Object.values(
  ETvlTab,
);
const TvlTabIcon: ReactElement[] = [
  <LockFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export const TvlTabs = () => {
  const [selectedTab, setSelectedTab] = useState(
    ETvlTab.TVL,
  );

  return (
    <TableAndChartTabs
      tabs={TvlTab}
      icons={TvlTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as ETvlTab)}
      className="space-y-9 w-full"
      triggerClassName=""
      enableAdvancedDivider
    >
      <TabContent
        value={ETvlTab.TVL}
        className="flex justify-center mx-auto"
      >
        <TvlTable />
      </TabContent>
    </TableAndChartTabs>
  );
};
