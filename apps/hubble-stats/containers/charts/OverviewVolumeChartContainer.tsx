import getVolumeChartData from '../../data/getVolumeChartData';
import { VolumeChartContainerClient } from './private';
import { ChartProps } from './types';

export default async function OverviewVolumeChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { volumeData, deposit24h } = await getVolumeChartData(
    startingEpoch,
    numDatesFromStart
  );

  return (
    <VolumeChartContainerClient deposit24h={deposit24h} data={volumeData} />
  );
}
