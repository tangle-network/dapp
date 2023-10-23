import { TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { Suspense, type FC } from 'react';

import { ContainerSkeleton } from '../../components';
import TransactionsTable from './TransactionsTable';
import { allTab, depositsTab, transfersTab, withdrawalsTab } from './tabs';

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
