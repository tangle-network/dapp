'use client';

import { FC, useState, useMemo } from 'react';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components';

import { PoolTransactionsTable } from '../../components';
import { PoolTransactionDataType } from '../../data';

const pageSize = 10;

const allTab = 'All Transactions' as const;
const depositsTab = 'Deposits' as const;
const transfersTab = 'Transfers' as const;
const withdrawalsTab = 'Withdrawals' as const;

const PoolTransactionsTableCmp: FC<PoolTransactionDataType> = ({
  transactions,
}) => {
  const [activeTab, setActiveTab] = useState<
    | typeof allTab
    | typeof depositsTab
    | typeof transfersTab
    | typeof withdrawalsTab
  >(allTab);

  const showingTransactions = useMemo(() => {
    switch (activeTab) {
      case allTab:
        return transactions;
      case depositsTab:
        return transactions.filter((tx) => tx.activity === 'deposit');
      case transfersTab:
        return transactions.filter((tx) => tx.activity === 'transfer');
      case withdrawalsTab:
        return transactions.filter((tx) => tx.activity === 'withdraw');
    }
  }, [transactions, activeTab]);

  return (
    <TableAndChartTabs
      tabs={[allTab, depositsTab, transfersTab, withdrawalsTab]}
      headerClassName="w-full overflow-x-auto"
      triggerClassName="whitespace-nowrap"
      onValueChange={(val) => setActiveTab(val as typeof activeTab)}
    >
      <PoolTransactionsTable data={showingTransactions} pageSize={pageSize} />
    </TableAndChartTabs>
  );
};

export default PoolTransactionsTableCmp;
