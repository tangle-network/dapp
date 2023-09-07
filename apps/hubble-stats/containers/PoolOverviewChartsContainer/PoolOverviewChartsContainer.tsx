import PoolOverviewChartsCmp from './PoolOverviewChartsCmp';
import { getPoolOverviewChartsData } from '../../data';

export default async function PoolOverviewChartsContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const {
    tvl,
    deposit24h,
    relayerEarnings24h,
    tvlData,
    volumeData,
    relayerEarningsData,
    currency,
  } = await getPoolOverviewChartsData(poolAddress);

  return (
    <PoolOverviewChartsCmp
      tvl={tvl}
      deposit24h={deposit24h}
      relayerEarnings24h={relayerEarnings24h}
      tvlData={tvlData}
      volumeData={volumeData}
      relayerEarningsData={relayerEarningsData}
      currency={currency}
    />
  );
}
