import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { FC } from 'react';

import {
  BLUEPRINTS_OPERATOR_DESCRIPTION,
  BLUEPRINTS_OPERATOR_TITLE,
} from '@webb-tools/tangle-shared-ui/constants';
import { BLUEPRINT_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import BlueprintListing from './BlueprintListing';

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <RestakeBanner
        title={BLUEPRINTS_OPERATOR_TITLE}
        description={BLUEPRINTS_OPERATOR_DESCRIPTION}
        buttonHref={BLUEPRINT_DOCS_LINK}
        buttonText="Get Started"
      />

      <BlueprintListing />
    </div>
  );
};

export default BlueprintsPage;
