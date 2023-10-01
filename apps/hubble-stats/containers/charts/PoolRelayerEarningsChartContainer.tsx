import { getPoolRelayerEarningsChartData } from '../../data';
import { BarChartContainerClient } from './client';
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
