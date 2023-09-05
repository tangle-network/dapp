import OverviewChartsCmp from './OverviewChartsCmp';
import { getOverviewChartsData } from '../../data';

export default async function OverviewChartsContainer() {
  const { currentTvl, deposit24h, tvlData, volumeData } =
    await getOverviewChartsData();

  return (
    <OverviewChartsCmp
      currentTvl={currentTvl}
      deposit24h={deposit24h}
      tvlData={tvlData}
      volumeData={volumeData}
    />
  );
}
