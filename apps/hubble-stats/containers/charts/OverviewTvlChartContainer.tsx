import { getOverviewTvlChartData } from '../../data';
import { AreaChartContainerClient } from './client';
import { ChartProps } from './types';

export default async function OverviewTvlChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { tvlData, currentTvl } = await getOverviewTvlChartData(
    startingEpoch,
    numDatesFromStart
  );

  return (
    <AreaChartContainerClient
      defaultValue={currentTvl}
      data={tvlData}
      heading="TVL"
    />
  );
}
