'use client';

import { FC, useMemo } from 'react';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components';

import { PoolTransactionsTable } from '../../components';
import { FilterButton } from '../../components/table';
import { PoolTransactionDataType } from '../../data';

const pageSize = 10;

const PoolTransactionsTableCmp: FC<PoolTransactionDataType> = ({
  transactions,
}) => {
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
      headerClassName="w-full overflow-x-auto"
      triggerClassName="whitespace-nowrap"
    >
      <PoolTransactionsTable data={transactions} pageSize={pageSize} />
    </TableAndChartTabs>
  );
};

export default PoolTransactionsTableCmp;
