'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';
import useSWR from 'swr';
import { ContainerSkeleton } from '../../components';
import {
  getShieldedAssetsTableData,
  getShieldedPoolsTableData,
} from '../../data/shieldedTables';
import ShieldedAssetsTableContainer from './ShieldedAssetsTableContainer';
import ShieldedPoolsTableContainer from './ShieldedPoolsTableContainer';

const pageSize = 5;
const assetsTableTab = 'Shielded Assets';
const poolsTableTab = 'Shielded Pools';

const ShieldedTablesContainer: FC<{
  epochNow: number;
}> = ({ epochNow }) => {
  const { data: shieldedAssetsData, isLoading: shieldedAssetLoading } = useSWR(
    [getShieldedAssetsTableData.name, epochNow],
    ([, ...args]) => getShieldedAssetsTableData(...args)
  );

  const { data: shieldedPoolsData, isLoading: shieldedPoolsLoading } = useSWR(
    [getShieldedPoolsTableData.name, epochNow],
    ([, ...args]) => getShieldedPoolsTableData(...args)
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
