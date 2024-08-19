import { Metadata } from 'next';
import { FC } from 'react';

import createPageMetadata from '../../utils/createPageMetadata';
import BlueprintListing from './BlueprintListing';
import TopBanner from './TopBanner';

export const metadata: Metadata = createPageMetadata({
  title: 'Blueprints',
});

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <TopBanner />

      <BlueprintListing />
    </div>
  );
};

export default BlueprintsPage;
