import { cache } from 'react';
import { getPoolRelayerEarningsChartData as getData } from '../../data';
import { BarChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

const getPoolRelayerEarningsChartData = cache(getData);

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
