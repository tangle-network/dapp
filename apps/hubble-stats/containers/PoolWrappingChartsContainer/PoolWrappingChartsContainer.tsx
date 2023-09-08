import PoolWrappingChartsCmp from './PoolWrappingChartsCmp';
import { getPoolWrappingChartsData } from '../../data';

export default async function PoolWrappingChartsContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const { twl, wrappingFees, twlData, wrappingFeesData, currency } =
    await getPoolWrappingChartsData(poolAddress);

  return (
    <PoolWrappingChartsCmp
      twl={twl}
      wrappingFees={wrappingFees}
      twlData={twlData}
      wrappingFeesData={wrappingFeesData}
      currency={currency}
    />
  );
}
