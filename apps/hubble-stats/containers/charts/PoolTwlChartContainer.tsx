import { getPoolTwlChartData } from '../../data/charts';
import { AreaChartContainerClient } from './private';
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
