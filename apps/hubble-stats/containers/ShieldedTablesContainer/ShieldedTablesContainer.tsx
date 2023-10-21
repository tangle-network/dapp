'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { cache, type FC } from 'react';
import useSWR from 'swr';
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
  const { data: shieldedAssetsData, isLoading: shieldedAssetLoading } = useSWR(
    'ShieldedTablesContainer-getShieldedAssetsTableData',
    () => getShieldedAssetsTableData(epochNow)
  );

  const { data: shieldedPoolsData, isLoading: shieldedPoolsLoading } = useSWR(
    'ShieldedTablesContainer-getShieldedPoolsTableData',
    () => getShieldedPoolsTableData(epochNow)
  );

  return (
    <TableAndChartTabs
      tabs={[assetsTableTab, poolsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Shielded Assets Table */}
      <TabContent value={assetsTableTab}>
        {shieldedAssetLoading || !shieldedAssetsData ? (
          <ContainerSkeleton />
        ) : (
          <ShieldedAssetsTableContainer
            value={shieldedAssetsData}
            pageSize={pageSize}
          />
        )}
      </TabContent>

      {/* Shielded Pools Table */}
      <TabContent value={poolsTableTab}>
        {shieldedPoolsLoading || !shieldedPoolsData ? (
          <ContainerSkeleton />
        ) : (
          <ShieldedPoolsTableContainer
            value={shieldedPoolsData}
            pageSize={pageSize}
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ShieldedTablesContainer;
