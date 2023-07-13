'use client';

import { useState, useMemo } from 'react';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components';

import { PoolTransactionsTable } from '../../components';
import { FilterButton } from '../../components/table';
import { PoolTransactionType } from '../../components/PoolTransactionsTable/types';

const pageSize = 10;

const PoolTransactionsTableContainer = () => {
  const [poolsData, setPoolsData] = useState<PoolTransactionType[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState<string>('');

  const filterButton = useMemo(
    () => (
      <FilterButton
        tokens={[]}
        selectedTokens={[]}
        setSelectedTokens={() => {
          return;
        }}
        sourceChains={[]}
        selectedSourceChains={[]}
        setSelectedSourceChains={() => {
          return;
        }}
        destinationChains={[]}
        selectedDestinationChains={[]}
        setSelectedDestinationChains={() => {
          return;
        }}
        showAllFn={() => {
          return;
        }}
      />
    ),
    []
  );

  return (
    <TableAndChartTabs
      tabs={['All Transactions', 'Deposits', 'Transfers', 'Withdrawals']}
      filterComponent={filterButton}
    >
      <PoolTransactionsTable
        data={poolsData}
        globalSearchText={globalSearchText}
        pageSize={pageSize}
      />
    </TableAndChartTabs>
  );
};

export default PoolTransactionsTableContainer;
