import { Suspense } from 'react';
import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import {
  PoolRelayerEarningsChartContainer,
  PoolTvlChartContainer,
  PoolVolumeChartContainer,
} from '../charts';
import { PoolChartSkeleton } from '../../components';
import { PoolChartPropsType } from '../charts/types';

const tvlTab = 'TVL';
const volumeTab = 'Volume';
const relayerEarningTab = 'Relayer Earnings';

export default function PoolOverviewChartsContainer({
  poolAddress,
  numDatesFromStart,
  startingEpoch,
  epochNow,
}: PoolChartPropsType) {
  return (
    <TableAndChartTabs tabs={[tvlTab, volumeTab, relayerEarningTab]}>
      {/* TVL */}
      <TabContent value={tvlTab}>
        <Suspense fallback={<PoolChartSkeleton />}>
          <PoolTvlChartContainer
            poolAddress={poolAddress}
            numDatesFromStart={numDatesFromStart}
            startingEpoch={startingEpoch}
            epochNow={epochNow}
          />
        </Suspense>
      </TabContent>

      {/* Volume */}
      <TabContent value={volumeTab}>
        <Suspense fallback={<PoolChartSkeleton />}>
          <PoolVolumeChartContainer
            poolAddress={poolAddress}
            numDatesFromStart={numDatesFromStart}
            startingEpoch={startingEpoch}
            epochNow={epochNow}
          />
        </Suspense>
      </TabContent>

      {/* Relayer Earnings */}
      <TabContent value={relayerEarningTab}>
        <Suspense fallback={<PoolChartSkeleton />}>
          <PoolRelayerEarningsChartContainer
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
