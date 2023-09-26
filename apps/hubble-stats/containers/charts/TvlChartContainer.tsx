import getTvlChartData from '../../data/getTvlChartData';
import TvlChartClient from './private/TvlChartClient';
import { ChartProps } from './types';

export default async function TvlChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { tvlData, currentTvl } = await getTvlChartData(
    startingEpoch,
    numDatesFromStart
  );

  return <TvlChartClient currentTvl={currentTvl} tvlData={tvlData} />;
}
