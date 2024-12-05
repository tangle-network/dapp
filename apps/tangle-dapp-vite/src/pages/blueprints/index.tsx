import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import { FC } from 'react';

import BlueprintListing from './BlueprintListing';

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <TopBanner />

      <BlueprintListing />
    </div>
  );
};

export default BlueprintsPage;
