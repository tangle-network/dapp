import { type FC, Suspense } from 'react';
import {
  TableAndChartTabs,
  TabContent,
  Typography,
} from '@webb-tools/webb-ui-components';

import { PoolOverviewTable, ContainerSkeleton } from '../../components';
import { PoolOverviewDataType } from '../../components/PoolOverviewTable/types';
import {
  getPoolDepositTableData,
  getPoolWithdrawalTableData,
  getPoolRelayerEarningsTableData,
} from '../../data/poolTables';

const deposit24hTab = 'Deposits 24H' as const;
const withdrawal24hTab = 'Withdrawals 24H' as const;
const relayerEarningsTab = 'Relayer Earnings' as const;

const PoolOverviewTableContainer: FC<{
  poolAddress: string;
  epochNow: number;
  availableTypedChainIds: number[];
}> = ({ poolAddress, epochNow, availableTypedChainIds }) => {
  return (
    <div className="space-y-1">
      <TableAndChartTabs
        tabs={[deposit24hTab, withdrawal24hTab, relayerEarningsTab]}
        headerClassName="w-full overflow-x-auto"
        triggerClassName="whitespace-nowrap"
      >
        {/* Deposit 24h */}
        <TabContent value={deposit24hTab}>
          <Suspense fallback={<ContainerSkeleton numOfRows={1} />}>
            <PoolOverviewTableCmp
              dataFetcher={() =>
                getPoolDepositTableData(
                  poolAddress,
                  epochNow,
                  availableTypedChainIds
                )
              }
              availableTypedChainIds={availableTypedChainIds}
            />
          </Suspense>
        </TabContent>

        {/* Withdrawal 24h */}
        <TabContent value={withdrawal24hTab}>
          <Suspense fallback={<ContainerSkeleton numOfRows={1} />}>
            <PoolOverviewTableCmp
              dataFetcher={() =>
                getPoolWithdrawalTableData(
                  poolAddress,
                  epochNow,
                  availableTypedChainIds
                )
              }
              availableTypedChainIds={availableTypedChainIds}
            />
          </Suspense>
        </TabContent>

        {/* Relayer Earnings */}
        <TabContent value={relayerEarningsTab}>
          <Suspense fallback={<ContainerSkeleton numOfRows={1} />}>
            <PoolOverviewTableCmp
              dataFetcher={() =>
                getPoolRelayerEarningsTableData(
                  poolAddress,
                  availableTypedChainIds
                )
              }
              availableTypedChainIds={availableTypedChainIds}
            />
          </Suspense>
          <Typography
            variant="body2"
            className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
          >
            *HISTORICAL RELAYER EARNINGS
          </Typography>
        </TabContent>
      </TableAndChartTabs>
    </div>
  );
};

export default PoolOverviewTableContainer;

async function PoolOverviewTableCmp({
  dataFetcher,
  availableTypedChainIds,
}: {
  dataFetcher: () => Promise<PoolOverviewDataType[]>;
  availableTypedChainIds: number[];
}) {
  const data = await dataFetcher();

  return (
    <PoolOverviewTable data={data} typedChainIds={availableTypedChainIds} />
  );
}
