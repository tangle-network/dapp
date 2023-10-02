import { getPoolTvlChartData } from '../../data';
import { AreaChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

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
