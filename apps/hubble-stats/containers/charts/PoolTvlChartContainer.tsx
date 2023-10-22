'use client';

import useSWR from 'swr';
import PoolChartSkeleton from '../../components/skeleton/PoolChartSkeleton';
import { getPoolTvlChartData } from '../../data';
import { AreaChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

export default function PoolTvlChartContainer(props: PoolChartPropsType) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { data: { currentPoolTvl, poolTvlData } = {}, isLoading } = useSWR(
    [getPoolTvlChartData.name, poolAddress, startingEpoch, numDatesFromStart],
    ([, ...args]) => getPoolTvlChartData(...args)
  );

  if (isLoading || !poolTvlData) {
    return <PoolChartSkeleton />;
  }

  return (
    <AreaChartContainerClient
      defaultValue={currentPoolTvl}
      data={poolTvlData}
    />
  );
}
