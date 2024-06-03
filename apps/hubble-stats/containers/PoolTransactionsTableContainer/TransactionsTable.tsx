'use client';

import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';
import useSWR from 'swr';
import { PoolTransactionsTable } from '../../components/PoolTransactionsTable';
import ContainerSkeleton from '../../components/skeleton/ContainerSkeleton';
import { getPoolTransactionsTableData } from '../../data';
import { allTab, depositsTab, transfersTab, withdrawalsTab } from './tabs';

const pageSize = 10;

function TransactionsTable({ poolAddress }: { poolAddress: string }) {
  const { data: allTransactions = [], isLoading } = useSWR(
    [getPoolTransactionsTableData.name, poolAddress],
    ([, ...args]) => getPoolTransactionsTableData(...args),
  );

  const deposits = allTransactions.filter((tx) => tx.activity === 'deposit');
  const transfers = allTransactions.filter((tx) => tx.activity === 'transfer');
  const withdrawals = allTransactions.filter(
    (tx) => tx.activity === 'withdraw',
  );

  if (isLoading) {
    return <ContainerSkeleton numOfRows={3} />;
  }

  return (
    <>
      <TabContent value={allTab}>
        <PoolTransactionsTable data={allTransactions} pageSize={pageSize} />
      </TabContent>
      <TabContent value={depositsTab}>
        <PoolTransactionsTable data={deposits} pageSize={pageSize} />
      </TabContent>
      <TabContent value={transfersTab}>
        <PoolTransactionsTable data={transfers} pageSize={pageSize} />
      </TabContent>
      <TabContent value={withdrawalsTab}>
        <PoolTransactionsTable data={withdrawals} pageSize={pageSize} />
      </TabContent>
    </>
  );
}

export default TransactionsTable;
