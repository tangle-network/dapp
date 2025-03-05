import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { GridFillIcon } from '@tangle-network/icons';
import { FC, ReactElement, useState } from 'react';
import { TabContent } from '@tangle-network/ui-components';
import {
  RegisteredBlueprints,
  type RegisteredBlueprintsTableProps,
} from './RegisteredBlueprints';

enum RegisteredBlueprintsTab {
  REGISTERED_BLUEPRINTS = 'Registered Blueprints',
}

const RegisteredBlueprintsTabIcon: ReactElement[] = [
  <GridFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export type RegisteredBlueprintsTabsProps = RegisteredBlueprintsTableProps & {
  // other props
};

export const RegisteredBlueprintsTabs: FC<RegisteredBlueprintsTabsProps> = ({
  blueprints,
  isLoading,
  error,
}) => {
  const [selectedTab, setSelectedTab] = useState(
    RegisteredBlueprintsTab.REGISTERED_BLUEPRINTS,
  );

  return (
    <TableAndChartTabs
      tabs={Object.values(RegisteredBlueprintsTab)}
      icons={RegisteredBlueprintsTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as RegisteredBlueprintsTab)}
      className="space-y-9 w-full"
      triggerClassName=""
      enableAdvancedDivider
    >
      <TabContent
        value={RegisteredBlueprintsTab.REGISTERED_BLUEPRINTS}
        className="flex justify-center mx-auto"
      >
        <RegisteredBlueprints
          blueprints={blueprints}
          isLoading={isLoading}
          error={error}
        />
      </TabContent>
    </TableAndChartTabs>
  );
};
