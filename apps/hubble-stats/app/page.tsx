import { KeyMetricsTable } from '../components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubble Stats',
  description: 'Welcome to Hubble Stats!',
};

export default async function Index() {
  return (
    <div className="py-4">
      <KeyMetricsTable />
    </div>
  );
}
