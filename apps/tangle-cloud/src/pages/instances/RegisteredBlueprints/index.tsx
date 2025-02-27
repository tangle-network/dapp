import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { RegisteredBlueprints } from './RegisteredBlueprints';
import { GridFillIcon } from '@tangle-network/icons';
import { ReactElement, useState } from 'react';
import { TabContent } from '@tangle-network/ui-components';

enum ERegisteredBlueprintsTab {
  REGISTERED_BLUEPRINTS = 'Registered Blueprints',
}

const RegisteredBlueprintsTab: string[] = Object.values(
  ERegisteredBlueprintsTab,
);
const RegisteredBlueprintsTabIcon: ReactElement[] = [
  <GridFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export const RegisteredBlueprintsTabs = () => {
  const [selectedTab, setSelectedTab] = useState(
    ERegisteredBlueprintsTab.REGISTERED_BLUEPRINTS,
  );

  return (
    <TableAndChartTabs
      tabs={RegisteredBlueprintsTab}
      icons={RegisteredBlueprintsTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as ERegisteredBlueprintsTab)}
      className="space-y-9 w-full"
      triggerClassName=""
      enableAdvancedDivider
    >
      <TabContent
        value={ERegisteredBlueprintsTab.REGISTERED_BLUEPRINTS}
        className="flex justify-center mx-auto"
      >
        <RegisteredBlueprints />
      </TabContent>
    </TableAndChartTabs>
  );
};
