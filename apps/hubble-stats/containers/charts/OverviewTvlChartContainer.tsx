'use client';

import useSWR from 'swr';
import ContainerSkeleton from '../../components/skeleton/ContainerSkeleton';
import { getOverviewTvlChartData } from '../../data';
import { AreaChartContainerClient } from './client';
import { ChartProps } from './types';

export default function OverviewTvlChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch } = props;

  const { data: { tvlData, currentTvl } = {}, isLoading } = useSWR(
    [getOverviewTvlChartData.name, startingEpoch, numDatesFromStart],
    ([, ...args]) => getOverviewTvlChartData(...args)
  );

  if (isLoading || !tvlData) {
    return <ContainerSkeleton numOfRows={1} className="min-h-[330px]" />;
  }

  return (
    <AreaChartContainerClient
      defaultValue={currentTvl}
      data={tvlData}
      heading="TVL"
    />
  );
}
