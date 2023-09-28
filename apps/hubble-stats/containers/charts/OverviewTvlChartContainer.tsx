import getOverviewTvlChartData from '../../data/charts/getOverviewTvlChartData';
import { AreaChartContainerClient } from './private';
import { ChartProps } from './types';

export default async function OverviewTvlChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { tvlData, currentTvl } = await getOverviewTvlChartData(
    startingEpoch,
    numDatesFromStart
  );

  return <AreaChartContainerClient defaultValue={currentTvl} data={tvlData} />;
}
