'use client';

import {
  TabContent,
  TableAndChartTabs,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import useSWR from 'swr';
import { ContainerSkeleton, PoolWrappingTable } from '../../components';
import { getPoolTwlTableData, getPoolWrappingFeesTableData } from '../../data';

const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees';

const PoolWrappingTableContainer: FC<{
  poolAddress: string;
  epochNow: number;
  availableTypedChainIds: number[];
}> = ({ poolAddress, availableTypedChainIds }) => {
  const { data: twlData, isLoading: twlLoading } = useSWR(
    [getPoolTwlTableData.name, poolAddress, availableTypedChainIds],
    ([, ...args]) => getPoolTwlTableData(...args),
  );

  const { data: wrappingFeesData, isLoading: wrappingFeesLoading } = useSWR(
    [getPoolWrappingFeesTableData.name, poolAddress, availableTypedChainIds],
    ([, ...args]) => getPoolWrappingFeesTableData(...args),
  );

  return (
    <div className="space-y-1">
      <TableAndChartTabs
        tabs={[twlTab, wrappingFeesTab]}
        headerClassName="w-full overflow-x-auto"
        triggerClassName="whitespace-nowrap"
      >
        {/* Deposit 24h */}
        <TabContent value={twlTab}>
          {twlLoading ? (
            <ContainerSkeleton />
          ) : (
            <PoolWrappingTable
              data={twlData}
              typedChainIds={availableTypedChainIds}
            />
          )}
          <Typography
            variant="body2"
            className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
          >
            *TOTAL WRAPPED LOCKED
          </Typography>
        </TabContent>

        {/* Withdrawal 24h */}
        <TabContent value={wrappingFeesTab}>
          {wrappingFeesLoading ? (
            <ContainerSkeleton />
          ) : (
            <PoolWrappingTable
              data={wrappingFeesData}
              typedChainIds={availableTypedChainIds}
            />
          )}
          <Typography
            variant="body2"
            className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
          >
            *HISTORICAL WRAPPING FEES
          </Typography>
        </TabContent>
      </TableAndChartTabs>
    </div>
  );
};

export default PoolWrappingTableContainer;
