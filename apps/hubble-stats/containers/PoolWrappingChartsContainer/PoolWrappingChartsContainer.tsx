import PoolWrappingChartsCmp from './PoolWrappingChartsCmp';
import { getPoolWrappingChartsData } from '../../data';

export default async function PoolWrappingChartsContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const { twl, wrappingFees24h, twlData, wrappingFeesData, currency } =
    await getPoolWrappingChartsData(poolAddress);

  return (
    <PoolWrappingChartsCmp
      twl={twl}
      wrappingFees24h={wrappingFees24h}
      twlData={twlData}
      wrappingFeesData={wrappingFeesData}
      currency={currency}
    />
  );
}
