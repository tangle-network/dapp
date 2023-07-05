import { TabContent, TabsRoot } from '@webb-tools/webb-ui-components';

import { ChainFilter, ShieldedAssetsTable, ShieldedPoolsTable } from '.';
import { TabsTriggerList } from '..';

const tabs = [
  {
    value: 'assets',
    title: 'Shielded Assets',
    component: <ShieldedAssetsTable />,
  },
  {
    value: 'pools',
    title: 'Shielded Pools',
    component: <ShieldedPoolsTable />,
  },
];

export const ShieldedTables = () => {
  return (
    <TabsRoot defaultValue="assets" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsTriggerList tabs={tabs} />
        <ChainFilter />
      </div>

      {tabs.map((tab, idx) => {
        return (
          <TabContent key={idx} value={tab.value}>
            {tab.component}
          </TabContent>
        );
      })}
    </TabsRoot>
  );
};
