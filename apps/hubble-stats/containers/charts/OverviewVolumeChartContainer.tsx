import { cache } from 'react';
import { getOverviewVolumeChartData as getData } from '../../data';
import { VolumeChartContainerClient } from './client';
import { ChartProps } from './types';

const getOverviewVolumeChartData = cache(getData);

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
