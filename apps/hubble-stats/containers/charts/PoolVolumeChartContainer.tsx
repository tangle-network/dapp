'use client';

import useSWR from 'swr';
import PoolChartSkeleton from '../../components/skeleton/PoolChartSkeleton';
import { getPoolVolumeChartData } from '../../data';
import { VolumeChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

export default function PoolVolumeChartContainer(props: PoolChartPropsType) {
  const { poolAddress, numDatesFromStart, startingEpoch, epochNow } = props;

  const { data: { poolVolumeData, poolDeposit24h } = {}, isLoading } = useSWR(
    [
      getPoolVolumeChartData.name,
      poolAddress,
      startingEpoch,
      epochNow,
      numDatesFromStart,
    ],
    ([, ...args]) => getPoolVolumeChartData(...args),
  );

  if (isLoading || !poolVolumeData) {
    return <PoolChartSkeleton />;
  }

  return (
    <VolumeChartContainerClient
      deposit24h={poolDeposit24h}
      data={poolVolumeData}
    />
  );
}
