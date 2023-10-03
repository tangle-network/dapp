import { cache } from 'react';
import { getOverviewTvlChartData as getData } from '../../data';
import { AreaChartContainerClient } from './client';
import { ChartProps } from './types';

const getOverviewTvlChartData = cache(getData);

export default async function OverviewTvlChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  console.time('getOverviewTvlChartData');
  const { tvlData, currentTvl } = await getOverviewTvlChartData(
    startingEpoch,
    numDatesFromStart
  );
  console.timeEnd('getOverviewTvlChartData');

  return (
    <AreaChartContainerClient
      defaultValue={currentTvl}
      data={tvlData}
      heading="TVL"
    />
  );
}
