import { type FC, Suspense } from 'react';
import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import ShieldedAssetsTableContainer from './ShieldedAssetsTableContainer';
import ShieldedPoolsTableContainer from './ShieldedPoolsTableContainer';
import {
  getShieldedAssetsTableData,
  getShieldedPoolsTableData,
} from '../../data/shieldedTables';
import { ContainerSkeleton } from 'apps/hubble-stats/components';

const pageSize = 5;
const assetsTableTab = 'Shielded Assets';
const poolsTableTab = 'Shielded Pools';

export default function ShieldedTablesContainer() {
  return (
    <TableAndChartTabs
      tabs={[assetsTableTab, poolsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Shielded Assets Table */}
      <TabContent value={assetsTableTab}>
        <Suspense fallback={<ContainerSkeleton />}>
          <ShieldedAssetsTableContainer
            dataFetcher={getShieldedAssetsTableData}
            pageSize={pageSize}
          />
        </Suspense>
      </TabContent>

      {/* Shielded Pools Table */}
      <TabContent value={poolsTableTab}>
        <Suspense fallback={<ContainerSkeleton />}>
          <ShieldedPoolsTableContainer
            dataFetcher={getShieldedPoolsTableData}
            pageSize={pageSize}
          />
        </Suspense>
      </TabContent>
    </TableAndChartTabs>
  );
}
