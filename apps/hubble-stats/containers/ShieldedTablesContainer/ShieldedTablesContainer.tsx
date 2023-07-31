'use client';

import { FC } from 'react';
import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import { ShieldedAssetsTable, ShieldedPoolsTable } from '../../components';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';

interface ShieldedTablesContainerProps {
  assetsData?: ShieldedAssetType[];
  poolsData?: ShieldedPoolType[];
}

const pageSize = 5;
const assetsTableTab = 'Shielded Assets';
const poolsTableTab = 'Shielded Pools';

const ShieldedTablesContainer: FC<ShieldedTablesContainerProps> = ({
  assetsData = [],
  poolsData = [],
}) => {
  return (
    <TableAndChartTabs
      tabs={[assetsTableTab, poolsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Shielded Assets Table */}
      <TabContent value={assetsTableTab}>
        <ShieldedAssetsTable data={assetsData} pageSize={pageSize} />
      </TabContent>

      {/* Shielded Pools Table */}
      <TabContent value={poolsTableTab}>
        <ShieldedPoolsTable data={poolsData} pageSize={pageSize} />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ShieldedTablesContainer;
