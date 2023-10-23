'use client';

import useSWR from 'swr';
import ContainerSkeleton from '../../components/skeleton/ContainerSkeleton';
import { getOverviewVolumeChartData } from '../../data';
import { VolumeChartContainerClient } from './client';
import { ChartProps } from './types';

export default function OverviewVolumeChartContainer(props: ChartProps) {
  const { numDatesFromStart, startingEpoch, epochNow } = props;

  const { data: { volumeData, deposit24h } = {}, isLoading } = useSWR(
    [
      getOverviewVolumeChartData.name,
      startingEpoch,
      epochNow,
      numDatesFromStart,
    ],
    ([, ...args]) => getOverviewVolumeChartData(...args)
  );

  if (isLoading || !volumeData) {
    return <ContainerSkeleton numOfRows={1} className="min-h-[330px]" />;
  }

  return (
    <VolumeChartContainerClient
      deposit24h={deposit24h}
      data={volumeData}
      heading="Volume 24h"
    />
  );
}
