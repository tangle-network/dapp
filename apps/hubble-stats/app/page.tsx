import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
  OverviewChartsContainer,
} from '../containers';

export default async function Index() {
  return (
    <div className="py-4 space-y-6">
      <OverviewChartsContainer />
      <KeyMetricsTableContainer />
      <ShieldedTablesContainer />
    </div>
  );
}
