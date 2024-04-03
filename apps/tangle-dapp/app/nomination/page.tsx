import { Typography } from '@webb-tools/webb-ui-components';

import {
  HeaderChipsContainer,
  KeyStatsContainer,
  NominationsPayoutsContainer,
  NominatorStatsContainer,
  ValidatorTablesContainer,
} from '../../containers';

// Note: already tried using Suspense here but see no improvement
export default async function NominationPage() {
  return (
    <div className="space-y-6 md:space-y-9 lg:space-y-12">
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Overview
        </Typography>

        <HeaderChipsContainer />
      </div>

      <KeyStatsContainer />

      <NominatorStatsContainer />

      <NominationsPayoutsContainer />

      <ValidatorTablesContainer />
    </div>
  );
}
