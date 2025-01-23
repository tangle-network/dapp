import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { FC } from 'react';

import { BLUEPRINT_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import BlueprintListing from './BlueprintListing';

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <RestakeBanner
        title="Register Your First Blueprint"
        description="Select a Blueprint, customize settings, and register your decentralized service in minutes."
        buttonHref={BLUEPRINT_DOCS_LINK}
        buttonText="Get Started"
      />

      <BlueprintListing />
    </div>
  );
};

export default BlueprintsPage;
