'use client';

import { useState } from 'react';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components';

import { PoolTransactionsTable } from '../../components';
import { PoolTransactionType } from '../../components/PoolTransactionsTable/types';

const pageSize = 10;

const PoolTransactionsTableContainer = () => {
  const [poolsData, setPoolsData] = useState<PoolTransactionType[]>([]);
  const [globalSearchText, setGlobalSearchText] = useState<string>('');

  return (
    <TableAndChartTabs
      tabs={['All Transactions', 'Deposits', 'Transfers', 'Withdrawals']}
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
