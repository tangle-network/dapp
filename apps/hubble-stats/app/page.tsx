import { ComponentProps, Suspense } from 'react';
import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
} from '../containers';
import TvlChartContainer from '../containers/charts/TvlChartContainer';
import { VolumeChartContainer } from '../containers/charts/VolumeChartContainer';
import { getEpoch24H, getEpochStart, getNumDatesFromStart } from '../utils';
import { LoadingScreen } from '../components';

// force homepage to be dynamic
export const dynamic = 'force-dynamic';

// revalidate every 5 seconds
export const revalidate = 5;

export default async function Index() {
  const startingEpoch = getEpochStart();

  const epoch24h = getEpoch24H();

  const chartProps: ComponentProps<typeof TvlChartContainer> = {
    numDatesFromStart: getNumDatesFromStart(),
    startingEpoch,
  };

  return (
    <div className="py-4 space-y-6">
      {/** Overview charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Suspense fallback={<LoadingScreen />}>
          <TvlChartContainer {...chartProps} />
        </Suspense>

        <Suspense fallback={<LoadingScreen />}>
          <VolumeChartContainer {...chartProps} />
        </Suspense>
      </div>

      <KeyMetricsTableContainer
        epochStart={startingEpoch}
        epoch24h={epoch24h}
      />

      {/* <ShieldedTablesContainer /> */}
    </div>
  );
}
