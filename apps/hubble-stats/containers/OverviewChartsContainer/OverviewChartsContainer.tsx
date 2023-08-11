import OverviewChartsCmp from './OverviewChartsCmp';
import { getOverviewChartsData } from '../../data';

export default async function OverviewChartsContainer() {
  const { currentTvl, currentVolume, tvlData, volumeData } =
    await getOverviewChartsData();

  return (
    <OverviewChartsCmp
      currentTvl={currentTvl}
      currentVolume={currentVolume}
      tvlData={tvlData}
      volumeData={volumeData}
    />
  );
}
