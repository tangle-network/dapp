import { type FC, Suspense } from 'react';
import {
  TableAndChartTabs,
  TabContent,
  Typography,
} from '@webb-tools/webb-ui-components';

import { PoolWrappingTable, ContainerSkeleton } from '../../components';
import { PoolWrappingDataType } from '../../components/PoolWrappingTable/types';
import {
  getPoolTwlTableData,
  getPoolWrappingFeesTableData,
} from '../../data/poolTables';

const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees';

const PoolWrappingTableContainer: FC<{
  poolAddress: string;
  epochNow: number;
  availableTypedChainIds: number[];
}> = ({ poolAddress, epochNow, availableTypedChainIds }) => {
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
