import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
} from '../containers';

export default async function Index() {
  return (
    <div className="py-4 space-y-8">
      <KeyMetricsTableContainer />
      <ShieldedTablesContainer />
    </div>
  );
}
