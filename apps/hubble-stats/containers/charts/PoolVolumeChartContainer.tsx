import { getPoolVolumeChartData } from '../../data/charts';
import { VolumeChartContainerClient } from './private';
import { PoolChartPropsType } from './types';

export default async function PoolVolumeChartContainer(
  props: PoolChartPropsType
) {
  const { poolAddress, numDatesFromStart, startingEpoch, epochNow } = props;

  const { poolDeposit24h, poolVolumeData } = await getPoolVolumeChartData(
    poolAddress,
    startingEpoch,
    epochNow,
    numDatesFromStart
  );

  return (
    <VolumeChartContainerClient
      deposit24h={poolDeposit24h}
      data={poolVolumeData}
    />
  );
}
