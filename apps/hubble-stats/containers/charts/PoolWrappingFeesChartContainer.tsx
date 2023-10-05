import { cache } from 'react';
import { getPoolWrappingFeesChartData as getData } from '../../data';
import { BarChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

const getPoolWrappingFeesChartData = cache(getData);

export default async function PoolWrappingFeesChartContainer(
  props: PoolChartPropsType
) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { poolWrappingFees, poolWrappingFeesData } =
    await getPoolWrappingFeesChartData(
      poolAddress,
      startingEpoch,
      numDatesFromStart
    );

  return (
    <BarChartContainerClient
      defaultValue={poolWrappingFees}
      data={poolWrappingFeesData}
    />
  );
}
