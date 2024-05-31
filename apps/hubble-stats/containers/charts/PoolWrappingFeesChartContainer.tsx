'use client';

import useSWR from 'swr';
import PoolChartSkeleton from '../../components/skeleton/PoolChartSkeleton';
import { getPoolWrappingFeesChartData } from '../../data';
import { BarChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

export default function PoolWrappingFeesChartContainer(
  props: PoolChartPropsType,
) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { data: { poolWrappingFeesData, poolWrappingFees } = {}, isLoading } =
    useSWR(
      [
        getPoolWrappingFeesChartData.name,
        poolAddress,
        startingEpoch,
        numDatesFromStart,
      ],
      ([, ...args]) => getPoolWrappingFeesChartData(...args),
    );

  if (isLoading || !poolWrappingFeesData) {
    return <PoolChartSkeleton />;
  }

  return (
    <BarChartContainerClient
      defaultValue={poolWrappingFees}
      data={poolWrappingFeesData}
    />
  );
}
