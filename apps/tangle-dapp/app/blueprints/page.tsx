import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import { Metadata } from 'next';
import { FC } from 'react';

import createPageMetadata from '../../utils/createPageMetadata';
import BlueprintListing from './BlueprintListing';

export const metadata: Metadata = createPageMetadata({
  title: 'Blueprints',
});

export const dynamic = 'force-static';

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <TopBanner />

      <BlueprintListing />
    </div>
  );
};

export default BlueprintsPage;
