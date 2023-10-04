import {
  TabContent,
  TableAndChartTabs,
  Typography,
} from '@webb-tools/webb-ui-components';
import { Suspense, cache, type FC } from 'react';

import { ContainerSkeleton, PoolWrappingTable } from '../../components';
import { PoolWrappingDataType } from '../../components/PoolWrappingTable/types';
import {
  getPoolTwlTableData as getTwl,
  getPoolWrappingFeesTableData as getWrappingFees,
} from '../../data';

const getPoolTwlTableData = cache(getTwl);
const getPoolWrappingFeesTableData = cache(getWrappingFees);

const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees';

const PoolWrappingTableContainer: FC<{
  poolAddress: string;
  epochNow: number;
  availableTypedChainIds: number[];
}> = ({ poolAddress, availableTypedChainIds }) => {
  return (
    <div className="space-y-1">
      <TableAndChartTabs
        tabs={[twlTab, wrappingFeesTab]}
        headerClassName="w-full overflow-x-auto"
        triggerClassName="whitespace-nowrap"
      >
        {/* Deposit 24h */}
        <TabContent value={twlTab}>
          <Suspense fallback={<ContainerSkeleton />}>
            <PoolWrappingTableCmp
              dataFetcher={() =>
                getPoolTwlTableData(poolAddress, availableTypedChainIds)
              }
              availableTypedChainIds={availableTypedChainIds}
            />
          </Suspense>
          <Typography
            variant="body2"
            className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
          >
            *TOTAL WRAPPED LOCKED
          </Typography>
        </TabContent>

        {/* Withdrawal 24h */}
        <TabContent value={wrappingFeesTab}>
          <Suspense fallback={<ContainerSkeleton />}>
            <PoolWrappingTableCmp
              dataFetcher={() =>
                getPoolWrappingFeesTableData(
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
            *HISTORICAL WRAPPING FEES
          </Typography>
        </TabContent>
      </TableAndChartTabs>
    </div>
  );
};

export default PoolWrappingTableContainer;

async function PoolWrappingTableCmp({
  dataFetcher,
  availableTypedChainIds,
}: {
  dataFetcher: () => Promise<PoolWrappingDataType[]>;
  availableTypedChainIds: number[];
}) {
  const data = await dataFetcher();

  return (
    <PoolWrappingTable data={data} typedChainIds={availableTypedChainIds} />
  );
}
