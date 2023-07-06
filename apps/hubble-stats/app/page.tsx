import { KeyMetricsTable, ShieldedTables } from '../components';

export default async function Index() {
  return (
    <div className="py-4 space-y-8">
      <KeyMetricsTable />
      <ShieldedTables />
    </div>
  );
}
