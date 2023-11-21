import { Typography } from '@webb-tools/webb-ui-components';

import {
  HeaderChipsContainer,
  KeyMetricsTableContainer,
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
        <KeyMetricsTableContainer />
      </div>

      <div className="mt-12">
        <NominatorStatsContainer />
      </div>

      <div className="mt-12">
        <ValidatorTablesContainer />
      </div>
    </div>
  );
}
