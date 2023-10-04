import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { Suspense, cache, type FC } from 'react';

import { ContainerSkeleton } from '../../components';
import {
  getShieldedAssetsTableData as getShieldedAssets,
  getShieldedPoolsTableData as getShieldedPools,
} from '../../data/shieldedTables';
import ShieldedAssetsTableContainer from './ShieldedAssetsTableContainer';
import ShieldedPoolsTableContainer from './ShieldedPoolsTableContainer';

const getShieldedAssetsTableData = cache(getShieldedAssets);
const getShieldedPoolsTableData = cache(getShieldedPools);

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
