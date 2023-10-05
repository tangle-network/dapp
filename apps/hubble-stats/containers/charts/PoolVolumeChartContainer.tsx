import { cache } from 'react';
import { getPoolVolumeChartData as getData } from '../../data';
import { VolumeChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

const getPoolVolumeChartData = cache(getData);

export default async function PoolVolumeChartContainer(
  props: PoolChartPropsType
) {
  const { poolAddress, numDatesFromStart, startingEpoch, epochNow } = props;

  const { poolDeposit24h, poolVolumeData } = await getPoolVolumeChartData(
    poolAddress,
    startingEpoch,
    epochNow,
    numDatesFromStart
  );

  return (
    <VolumeChartContainerClient
      deposit24h={poolDeposit24h}
      data={poolVolumeData}
    />
  );
}
