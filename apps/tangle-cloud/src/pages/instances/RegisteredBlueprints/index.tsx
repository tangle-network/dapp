import { GridFillIcon } from '@tangle-network/icons';
import { FC, useState } from 'react';
import { RegisteredBlueprints } from './RegisteredBlueprints';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tangle-network/sandbox-ui/primitives';

enum RegisteredBlueprintsTab {
  REGISTERED_BLUEPRINTS = 'Registered Blueprints',
}

export const RegisteredBlueprintsTabs: FC = () => {
  const [selectedTab, setSelectedTab] = useState(
    RegisteredBlueprintsTab.REGISTERED_BLUEPRINTS,
  );

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(tab: string) =>
        setSelectedTab(tab as RegisteredBlueprintsTab)
      }
      className="w-full space-y-5"
    >
      <TabsList className="flex h-auto w-full justify-start rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-card)]">
        <TabsTrigger
          value={RegisteredBlueprintsTab.REGISTERED_BLUEPRINTS}
          className="gap-2 rounded-md px-3 py-2 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <GridFillIcon className="h-4 w-4 fill-current" />
          Registered Blueprints
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value={RegisteredBlueprintsTab.REGISTERED_BLUEPRINTS}
        className="w-full"
      >
        <RegisteredBlueprints />
      </TabsContent>
    </Tabs>
  );
};
