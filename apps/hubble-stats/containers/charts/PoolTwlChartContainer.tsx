import { getPoolTwlChartData } from '../../data';
import { AreaChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

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
