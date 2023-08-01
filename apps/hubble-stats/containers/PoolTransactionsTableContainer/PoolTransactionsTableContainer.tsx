import { FC, useMemo } from 'react';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components';

import { PoolTransactionsTable } from '../../components';
import { FilterButton } from '../../components/table';
import { PoolTransactionType } from '../../components/PoolTransactionsTable/types';

interface PoolTransactionsTableContainerProps {
  poolsData?: PoolTransactionType[];
}

const pageSize = 10;

const PoolTransactionsTableContainer: FC<
  PoolTransactionsTableContainerProps
> = ({ poolsData = [] }) => {
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
      <PoolTransactionsTable data={poolsData} pageSize={pageSize} />
    </TableAndChartTabs>
  );
};

export default PoolTransactionsTableContainer;
