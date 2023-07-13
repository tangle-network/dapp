import { Metadata } from 'next';
import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
} from '../containers';
import { VolumeChartsContainer } from '../containers/VolumeChartsContainer';

export const metadata: Metadata = {
  title: 'Hubble Stats',
  description: 'Welcome to Hubble Stats!',
};

export default async function Index() {
  return (
    <div className="py-4 space-y-8">
      <VolumeChartsContainer />
      <KeyMetricsTableContainer />
      <ShieldedTablesContainer />
    </div>
  );
}
