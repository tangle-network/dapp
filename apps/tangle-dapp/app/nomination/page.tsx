import { Typography } from '@webb-tools/webb-ui-components';

import {
  DelegationsPayoutsContainer,
  HeaderChipsContainer,
  KeyStatsContainer,
  NominatorStatsContainer,
  ValidatorTablesContainer,
} from '../../containers';

// Note: already tried using Suspense here but see no improvement
export default async function Index() {
  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Overview
        </Typography>

        <HeaderChipsContainer />
      </div>

      <KeyStatsContainer />

      <NominatorStatsContainer />

      <DelegationsPayoutsContainer />

      <ValidatorTablesContainer />
    </div>
  );
}
