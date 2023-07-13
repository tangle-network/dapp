import { Metadata } from 'next';

import {
  KeyMetricsTableContainer,
  ShieldedTablesContainer,
} from '../containers';

export const metadata: Metadata = {
  title: 'Hubble Stats',
  description: 'Welcome to Hubble Stats!',
};

export default async function Index() {
  return (
    <div className="py-4 space-y-8">
      <KeyMetricsTableContainer />
      <ShieldedTablesContainer />
    </div>
  );
}
