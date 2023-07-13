'use client';

import { useState, useMemo } from 'react';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components';

import { PoolTransactionsTable } from '../../components';
import { FilterButton } from '../../components/table';
import { PoolTransactionType } from '../../components/PoolTransactionsTable/types';

const pageSize = 10;

const PoolTransactionsTableContainer = () => {
  const [poolsData, setPoolsData] = useState<PoolTransactionType[]>([
    {
      txHash: '0x1234567890',
      activity: 'deposit',
      tokenAmount: 100,
      tokenSymbol: 'ETH',
      source: 'ethereum',
      sourceChainType: 'ethereum',
      destination: 'webb',
      time: 1629780000,
    },
    {
      txHash: '0x1234567890',
      activity: 'transfer',
      tokenAmount: 100,
      tokenSymbol: 'ETH',
      source: 'ethereum',
      sourceChainType: 'ethereum',
      destination: 'webb',
      time: 1629780000,
    },
    {
      txHash: '0x1234567890',
      activity: 'withdraw',
      tokenAmount: 100,
      tokenSymbol: 'ETH',
      source: 'ethereum',
      sourceChainType: 'ethereum',
      destination: 'webb',
      time: 1629780000,
    },
  ]);
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
