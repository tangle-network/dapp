import { getPoolRelayerEarningsChartData } from '../../data/charts';
import { BarChartContainerClient } from './private';
import { PoolChartPropsType } from './types';

export default async function PoolRelayerEarningsChartContainer(
  props: PoolChartPropsType
) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { relayerEarnings, poolRelayerEarningsData } =
    await getPoolRelayerEarningsChartData(
      poolAddress,
      startingEpoch,
      numDatesFromStart
    );

  return (
    <BarChartContainerClient
      defaultValue={relayerEarnings}
      data={poolRelayerEarningsData}
    />
  );
}
