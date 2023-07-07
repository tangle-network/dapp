'use client';

import { useState, useMemo } from 'react';
import {
  TableAndChartTabs,
  TableAndChartTabType,
} from '@webb-tools/webb-ui-components';

import { ShieldedAssetsTable, ShieldedPoolsTable } from '../../components';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';

const pageSize = 5;

const ShieldedTablesContainer = () => {
  const [assetsData, setAssetsData] = useState<ShieldedAssetType[]>([]);
  const [poolsData, setPoolsData] = useState<ShieldedPoolType[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState<string>('');

  const tabs = useMemo<TableAndChartTabType[]>(
    () => [
      {
        value: 'Shielded Assets',
        component: (
          <ShieldedAssetsTable
            data={assetsData}
            globalSearchText={globalSearchText}
            pageSize={pageSize}
          />
        ),
      },
      {
        value: 'Shielded Pools',
        component: (
          <ShieldedPoolsTable
            data={poolsData}
            globalSearchText={globalSearchText}
            pageSize={pageSize}
          />
        ),
      },
    ],
    [assetsData, poolsData, globalSearchText]
  );

  return <TableAndChartTabs tabs={tabs} />;
};

export default ShieldedTablesContainer;
