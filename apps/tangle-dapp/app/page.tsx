import { Typography } from '@webb-tools/webb-ui-components';

import {
  DelegationsPayoutsContainer,
  HeaderChipsContainer,
  KeyStatsContainer,
  NominatorStatsContainer,
  ValidatorTablesContainer,
} from '../containers';

export default async function Index() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Staking Overview
        </Typography>

        <HeaderChipsContainer />
      </div>

      <div className="mt-12">
        <KeyStatsContainer />
      </div>

      <div className="mt-12">
        <NominatorStatsContainer />
      </div>

      <div className="mt-12">
        <DelegationsPayoutsContainer />
      </div>

      <div className="mt-12">
        <ValidatorTablesContainer />
      </div>
    </div>
  );
}
