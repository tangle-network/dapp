import OverviewChartsCmp from './OverviewChartsCmp';
import { getOverviewChartsData } from '../../data';

export default async function OverviewChartsContainer() {
  const { currentTvl, volume24h, tvlData, volumeData } =
    await getOverviewChartsData();

  return (
    <OverviewChartsCmp
      currentTvl={currentTvl}
      volume24h={volume24h}
      tvlData={tvlData}
      volumeData={volumeData}
    />
  );
}
