import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
} from '../containers';
import {
  OverviewTvlChartContainer,
  OverviewVolumeChartContainer,
} from '../containers/charts';
import { getDateDataForPage } from '../utils';

export default function Index() {
  const { epochStart, epochNow, numDatesFromStart } = getDateDataForPage();

  const chartProps = {
    numDatesFromStart,
    startingEpoch: epochStart,
    epochNow,
  };

  return (
    <div className="py-4 space-y-6">
      {/** Overview charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OverviewTvlChartContainer {...chartProps} />

        <OverviewVolumeChartContainer {...chartProps} />
      </div>

      <KeyMetricsTableContainer epochStart={epochStart} epochNow={epochNow} />

      <ShieldedTablesContainer epochNow={epochNow} />
    </div>
  );
}
