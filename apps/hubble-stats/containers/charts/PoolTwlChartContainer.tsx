'use client';

import useSWR from 'swr';
import PoolChartSkeleton from '../../components/skeleton/PoolChartSkeleton';
import { getPoolTwlChartData } from '../../data';
import { AreaChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

export default function PoolTwlChartContainer(props: PoolChartPropsType) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { data: { poolTwlData, currentPoolTwl } = {}, isLoading } = useSWR(
    [getPoolTwlChartData.name, poolAddress, startingEpoch, numDatesFromStart],
    ([, ...args]) => getPoolTwlChartData(...args),
  );

  if (isLoading || !poolTwlData) {
    return <PoolChartSkeleton />;
  }

  return (
    <AreaChartContainerClient
      defaultValue={currentPoolTwl}
      data={poolTwlData}
    />
  );
}
