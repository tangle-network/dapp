'use client';

import { useState } from 'react';
import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import { ShieldedAssetsTable, ShieldedPoolsTable } from '../../components';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';

const pageSize = 5;
const assetsTableTab = 'Shielded Assets';
const poolsTableTab = 'Shielded Pools';

const ShieldedTablesContainer = () => {
  const [assetsData, setAssetsData] = useState<ShieldedAssetType[]>([]);
  const [poolsData, setPoolsData] = useState<ShieldedPoolType[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState<string>('');

  return (
    <TableAndChartTabs tabs={[assetsTableTab, poolsTableTab]}>
      {/* Shielded Assets Table */}
      <TabContent value={assetsTableTab}>
        <ShieldedAssetsTable
          data={assetsData}
          globalSearchText={globalSearchText}
          pageSize={pageSize}
        />
      </TabContent>

      {/* Shielded Pools Table */}
      <TabContent value={poolsTableTab}>
        <ShieldedPoolsTable
          data={poolsData}
          globalSearchText={globalSearchText}
          pageSize={pageSize}
        />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ShieldedTablesContainer;
