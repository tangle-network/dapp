import { getOverviewVolumeChartData } from '../../data';
import { VolumeChartContainerClient } from './client';
import { ChartProps } from './types';

export default async function OverviewVolumeChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch, epochNow } = props;

  const { volumeData, deposit24h } = await getOverviewVolumeChartData(
    startingEpoch,
    epochNow,
    numDatesFromStart
  );

  return (
    <VolumeChartContainerClient
      deposit24h={deposit24h}
      data={volumeData}
      heading="Volume 24h"
    />
  );
}
