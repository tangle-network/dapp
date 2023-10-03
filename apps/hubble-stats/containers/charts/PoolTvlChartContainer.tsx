import { cache } from 'react';
import { getPoolTvlChartData as getData } from '../../data';
import { AreaChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

const getPoolTvlChartData = cache(getData);

export default async function PoolTvlChartContainer(props: PoolChartPropsType) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { currentPoolTvl, poolTvlData } = await getPoolTvlChartData(
    poolAddress,
    startingEpoch,
    numDatesFromStart
  );

  return (
    <AreaChartContainerClient
      defaultValue={currentPoolTvl}
      data={poolTvlData}
    />
  );
}
