import getVolumeChartData from '../../data/getVolumeChartData';
import VolumeChartClient from './private/VolumeChartClient';
import { ChartProps } from './types';

export async function VolumeChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { volumeData, deposit24h } = await getVolumeChartData(
    startingEpoch,
    numDatesFromStart
  );

  return <VolumeChartClient deposit24h={deposit24h} volumeData={volumeData} />;
}
