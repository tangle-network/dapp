'use client';

import { useState } from 'react';
import { TabContent, TabsRoot } from '@webb-tools/webb-ui-components';

import { ShieldedAssetsTable } from './ShieldedAssetsTable';
import { ShieldedPoolsTable } from './ShieldedPoolsTable';
import { ShieldedAssetType, ShieldedPoolType } from './types';
import { TabsTriggerList } from '../TabsTriggerList';

const pageSize = 5;
const assetsTab = 'Shielded Assets';
const poolsTab = 'Shielded Pools';

export const ShieldedTables = () => {
  const [assetsData, setAssetsData] = useState<ShieldedAssetType[]>([]);
  const [poolsData, setPoolsData] = useState<ShieldedPoolType[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState<string>('');

  return (
    <TabsRoot defaultValue={assetsTab} className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsTriggerList tabs={[assetsTab, poolsTab]} />
      </div>

      <TabContent value={assetsTab}>
        <ShieldedAssetsTable
          data={assetsData}
          globalSearchText={globalSearchText}
          pageSize={pageSize}
        />
      </TabContent>

      <TabContent value={poolsTab}>
        <ShieldedPoolsTable
          data={poolsData}
          globalSearchText={globalSearchText}
          pageSize={pageSize}
        />
      </TabContent>
    </TabsRoot>
  );
};
