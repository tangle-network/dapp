import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
  OverviewChartsContainer,
} from '../containers';

// force homepage to be dynamic
export const dynamic = 'force-dynamic';
// revalidate every 5 seconds
export const revalidate = 5;

export default async function Index() {
  return (
    <div className="py-4 space-y-6">
      {/* @ts-expect-error Server Component */}
      <OverviewChartsContainer />
      {/* @ts-expect-error Server Component */}
      <KeyMetricsTableContainer />
      {/* @ts-expect-error Server Component */}
      <ShieldedTablesContainer />
    </div>
  );
}
