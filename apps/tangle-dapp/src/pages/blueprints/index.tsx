import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { FC } from 'react';

import BlueprintListing from './BlueprintListing';
import { BLUEPRINT_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <RestakeBanner
        title="Create Your First Blueprint"
        description="Learn how to set up a minimal Tangle Blueprint in minutes accompanied by a step-by-step guide."
        buttonHref={BLUEPRINT_DOCS_LINK}
        buttonText="Get Started"
      />

      <BlueprintListing />
    </div>
  );
};

export default BlueprintsPage;
