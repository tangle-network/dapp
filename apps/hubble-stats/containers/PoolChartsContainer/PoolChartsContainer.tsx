import PoolChartsCmp from './PoolChartsCmp';
import { getPoolChartsData } from '../../data';

export default async function PoolChartsContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const {
    currentTvl,
    currentVolume,
    currentFees,
    tvlData,
    volumeData,
    feesData,
  } = await getPoolChartsData(poolAddress);

  return (
    <PoolChartsCmp
      currentTvl={currentTvl}
      currentVolume={currentVolume}
      currentFees={currentFees}
      tvlData={tvlData}
      volumeData={volumeData}
      feesData={feesData}
    />
  );
}
