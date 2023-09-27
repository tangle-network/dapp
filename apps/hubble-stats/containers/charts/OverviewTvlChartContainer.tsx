import getTvlChartData from '../../data/getTvlChartData';
import { AreaChartContainerClient } from './private';
import { ChartProps } from './types';

export default async function OverviewTvlChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { tvlData, currentTvl } = await getTvlChartData(
    startingEpoch,
    numDatesFromStart
  );

  return <AreaChartContainerClient currentValue={currentTvl} data={tvlData} />;
}
