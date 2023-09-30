import { type FC, Suspense } from 'react';
import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import {
  PoolTwlChartContainer,
  PoolWrappingFeesChartContainer,
} from '../charts';
import { PoolChartSkeleton } from '../../components';
import { PoolChartPropsType } from '../charts/types';

const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees';

export default async function PoolWrappingChartsContainer({
  poolAddress,
  numDatesFromStart,
  startingEpoch,
  epochNow
}: PoolChartPropsType) {
  return (
    <TableAndChartTabs tabs={[twlTab, wrappingFeesTab]}>
      {/* TWL */}
      <TabContent value={twlTab}>
        <Suspense fallback={<PoolChartSkeleton />}>
          <PoolTwlChartContainer
            poolAddress={poolAddress}
            numDatesFromStart={numDatesFromStart}
            startingEpoch={startingEpoch}
            epochNow={epochNow}
          />
        </Suspense>
      </TabContent>

      {/* Wrapping Fees */}
      <TabContent value={wrappingFeesTab}>
        <Suspense fallback={<PoolChartSkeleton />}>
          <PoolWrappingFeesChartContainer
            poolAddress={poolAddress}
            numDatesFromStart={numDatesFromStart}
            startingEpoch={startingEpoch}
            epochNow={epochNow}
          />
        </Suspense>
      </TabContent>
    </TableAndChartTabs>
  );
}
