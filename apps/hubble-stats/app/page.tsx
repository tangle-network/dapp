import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
  OverviewChartsContainer,
} from '../containers';

export default async function Index() {
  return (
    <div className="py-4 space-y-6">
      <OverviewChartsContainer />
      {/* @ts-expect-error Server Component */}
      <KeyMetricsTableContainer />
      {/* @ts-expect-error Server Component */}
      <ShieldedTablesContainer />
    </div>
  );
}
