import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { PageLayout } from '@/components/layout/PageLayout';
import BlueprintListing from './BlueprintListing';

const pageConfig = {
  title: 'Blueprints',
  metadata: {
    title: 'Blueprints | Tangle Network',
    description: 'View and manage Tangle Network blueprints',
    openGraph: {
      title: 'Blueprints | Tangle Network',
      description: 'View and manage Tangle Network blueprints',
    },
  },
};

const BlueprintsPage: FC = () => {
  return (
    <PageLayout title={pageConfig.title} metadata={pageConfig.metadata}>
      <div className="space-y-5">
        <TopBanner />
        <BlueprintListing />
      </div>
    </PageLayout>
  );
};

export default BlueprintsPage;
