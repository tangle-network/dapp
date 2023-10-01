import { type FC, Suspense } from 'react';
import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import ShieldedAssetsTableContainer from './ShieldedAssetsTableContainer';
import ShieldedPoolsTableContainer from './ShieldedPoolsTableContainer';
import {
  getShieldedAssetsTableData,
  getShieldedPoolsTableData,
} from '../../data/shieldedTables';
import { ContainerSkeleton } from '../../components';

const pageSize = 5;
const assetsTableTab = 'Shielded Assets';
const poolsTableTab = 'Shielded Pools';

const ShieldedTablesContainer: FC<{
  epochNow: number;
}> = ({ epochNow }) => {
  return (
    <TableAndChartTabs
      tabs={[assetsTableTab, poolsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Shielded Assets Table */}
      <TabContent value={assetsTableTab}>
        <Suspense fallback={<ContainerSkeleton />}>
          <ShieldedAssetsTableContainer
            dataFetcher={() => getShieldedAssetsTableData(epochNow)}
            pageSize={pageSize}
          />
        </Suspense>
      </TabContent>

      {/* Shielded Pools Table */}
      <TabContent value={poolsTableTab}>
        <Suspense fallback={<ContainerSkeleton />}>
          <ShieldedPoolsTableContainer
            dataFetcher={() => getShieldedPoolsTableData(epochNow)}
            pageSize={pageSize}
          />
        </Suspense>
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ShieldedTablesContainer;
