import { cache } from 'react';
import { getPoolTwlChartData as getData } from '../../data';
import { AreaChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

const getPoolTwlChartData = cache(getData);

export default async function PoolTwlChartContainer(props: PoolChartPropsType) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { currentPoolTwl, poolTwlData } = await getPoolTwlChartData(
    poolAddress,
    startingEpoch,
    numDatesFromStart
  );

  return (
    <AreaChartContainerClient
      defaultValue={currentPoolTwl}
      data={poolTwlData}
    />
  );
}
