import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { RegisteredBlueprints } from './RegisteredBlueprints';
import { GridFillIcon } from "@tangle-network/icons";
import { ReactElement, useState } from 'react';
import { TabContent } from '@tangle-network/ui-components';

enum ERegisteredBlueprintsTab {
  REGISTERED_BLUEPRINTS = 'Registered Blueprints',
}

const RegisteredBlueprintsTab: string[] = Object.values(ERegisteredBlueprintsTab);
const RegisteredBlueprintsTabIcon: ReactElement[] = [
  <GridFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export const RegisteredBlueprintsTabs = () => {
  const [selectedTab, setSelectedTab] = useState(ERegisteredBlueprintsTab.REGISTERED_BLUEPRINTS);

  return (
    <TableAndChartTabs
      tabs={RegisteredBlueprintsTab}
      icons={RegisteredBlueprintsTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as ERegisteredBlueprintsTab)}
      headerClassName="w-full"
      className="space-y-9"
      triggerClassName="border-b-2 py-4 aria-selected:border-blue-50 border-mono-170 [&>*]:opacity-50 [&[aria-selected='true']>*]:opacity-100"
      enableAdvancedDivider
    >
      <TabContent
        value={ERegisteredBlueprintsTab.REGISTERED_BLUEPRINTS}
        className="flex justify-center md:min-w-[480px] mx-auto"
      >
        <RegisteredBlueprints />
      </TabContent>
    </TableAndChartTabs>
  )
}
