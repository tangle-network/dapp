import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { Suspense, cache, type FC } from 'react';

import { ContainerSkeleton, PoolTransactionsTable } from '../../components';
import { getPoolTransactionsTableData as getData } from '../../data';

const pageSize = 10;

const getPoolTransactionsTableData = cache(getData);

const allTab = 'All Transactions' as const;
const depositsTab = 'Deposits' as const;
const transfersTab = 'Transfers' as const;
const withdrawalsTab = 'Withdrawals' as const;

const PoolTransactionsTableContainer: FC<{
  poolAddress: string;
}> = ({ poolAddress }) => {
  return (
    <TableAndChartTabs
      tabs={[allTab, depositsTab, transfersTab, withdrawalsTab]}
      headerClassName="w-full overflow-x-auto"
      triggerClassName="whitespace-nowrap"
    >
      <Suspense fallback={<ContainerSkeleton numOfRows={3} />}>
        <TransactionsTable poolAddress={poolAddress} />
      </Suspense>
    </TableAndChartTabs>
  );
};

export default PoolTransactionsTableContainer;

async function TransactionsTable({ poolAddress }: { poolAddress: string }) {
  const allTransactions = await getPoolTransactionsTableData(poolAddress);
  const deposits = allTransactions.filter((tx) => tx.activity === 'deposit');
  const transfers = allTransactions.filter((tx) => tx.activity === 'transfer');
  const withdrawals = allTransactions.filter(
    (tx) => tx.activity === 'withdraw'
  );

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
