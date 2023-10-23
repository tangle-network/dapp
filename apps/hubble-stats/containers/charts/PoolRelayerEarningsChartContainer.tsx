'use client';

import useSWR from 'swr';
import PoolChartSkeleton from '../../components/skeleton/PoolChartSkeleton';
import { getPoolRelayerEarningsChartData } from '../../data';
import { BarChartContainerClient } from './client';
import { PoolChartPropsType } from './types';

export default function PoolRelayerEarningsChartContainer(
  props: PoolChartPropsType
) {
  const { poolAddress, numDatesFromStart, startingEpoch } = props;

  const { data: { poolRelayerEarningsData, relayerEarnings } = {}, isLoading } =
    useSWR(
      [
        getPoolRelayerEarningsChartData.name,
        poolAddress,
        startingEpoch,
        numDatesFromStart,
      ],
      ([, ...args]) => getPoolRelayerEarningsChartData(...args)
    );

  if (isLoading || !poolRelayerEarningsData) {
    return <PoolChartSkeleton />;
  }

  return (
    <BarChartContainerClient
      defaultValue={relayerEarnings}
      data={poolRelayerEarningsData}
    />
  );
}
