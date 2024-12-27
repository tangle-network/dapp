import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import { FC } from 'react';

import {
  BLUEPRINTS_OPERATOR_DESCRIPTION,
  BLUEPRINTS_OPERATOR_HIGHLIGHTED_TEXT,
  BLUEPRINTS_OPERATOR_TITLE,
} from '@webb-tools/tangle-shared-ui/constants';
import BlueprintListing from './BlueprintListing';

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <TopBanner
        title={BLUEPRINTS_OPERATOR_TITLE}
        highlightedText={BLUEPRINTS_OPERATOR_HIGHLIGHTED_TEXT}
        description={BLUEPRINTS_OPERATOR_DESCRIPTION}
      />

      <BlueprintListing />
    </div>
  );
};

export default BlueprintsPage;
