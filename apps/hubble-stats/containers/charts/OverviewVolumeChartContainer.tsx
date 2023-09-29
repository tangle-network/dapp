import getOverviewVolumeChartData from '../../data/charts/getOverviewVolumeChartData';
import { VolumeChartContainerClient } from './private';
import { ChartProps } from './types';

export default async function OverviewVolumeChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { volumeData, deposit24h } = await getOverviewVolumeChartData(
    startingEpoch,
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
