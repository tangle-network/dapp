'use client';

import {
  TabContent,
  TableAndChartTabs,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import useSWR from 'swr';
import { ContainerSkeleton, PoolOverviewTable } from '../../components';
import {
  getPoolDepositTableData,
  getPoolRelayerEarningsTableData,
  getPoolWithdrawalTableData,
} from '../../data';

const deposit24hTab = 'Deposits 24H' as const;
const withdrawal24hTab = 'Withdrawals 24H' as const;
const relayerEarningsTab = 'Relayer Earnings' as const;

const PoolOverviewTableContainer: FC<{
  poolAddress: string;
  epochNow: number;
  availableTypedChainIds: number[];
}> = ({ poolAddress, epochNow, availableTypedChainIds }) => {
  const { data: depositData, isLoading: depositLoading } = useSWR(
    [
      getPoolDepositTableData.name,
      poolAddress,
      epochNow,
      availableTypedChainIds,
    ],
    ([, ...args]) => getPoolDepositTableData(...args),
  );

  const { data: withdrawalData, isLoading: withdrawalLoading } = useSWR(
    [
      getPoolWithdrawalTableData.name,
      poolAddress,
      epochNow,
      availableTypedChainIds,
    ],
    ([, ...args]) => getPoolWithdrawalTableData(...args),
  );

  const { data: relayerEarningsData, isLoading: relayerEarningsLoading } =
    useSWR(
      [
        getPoolRelayerEarningsTableData.name,
        poolAddress,
        availableTypedChainIds,
      ],
      ([, ...args]) => getPoolRelayerEarningsTableData(...args),
    );

  return (
    <div className="space-y-1">
      <TableAndChartTabs
        tabs={[deposit24hTab, withdrawal24hTab, relayerEarningsTab]}
        headerClassName="w-full overflow-x-auto"
        triggerClassName="whitespace-nowrap"
      >
        {/* Deposit 24h */}
        <TabContent value={deposit24hTab}>
          {depositLoading ? (
            <ContainerSkeleton numOfRows={1} />
          ) : (
            <PoolOverviewTable
              data={depositData}
              typedChainIds={availableTypedChainIds}
            />
          )}
        </TabContent>

        {/* Withdrawal 24h */}
        <TabContent value={withdrawal24hTab}>
          {withdrawalLoading ? (
            <ContainerSkeleton numOfRows={1} />
          ) : (
            <PoolOverviewTable
              data={withdrawalData}
              typedChainIds={availableTypedChainIds}
            />
          )}
        </TabContent>

        {/* Relayer Earnings */}
        <TabContent value={relayerEarningsTab}>
          {relayerEarningsLoading ? (
            <ContainerSkeleton numOfRows={1} />
          ) : (
            <PoolOverviewTable
              data={relayerEarningsData}
              typedChainIds={availableTypedChainIds}
            />
          )}
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
