import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import { KeyStatsContainer } from '../../containers';
import NominatorStatsContainer from '../../containers/NominatorStatsContainer';
import NominationsPayoutsContainer from '../../containers/NominationsPayoutsContainer';
import NominationHeaderChips from '../../containers/NominationHeaderChips';
import NominationValidatorTables from '../../containers/NominationValidatorTables';

export default function NominationPage() {
  return (
    <div className="space-y-6 md:space-y-9 lg:space-y-12">
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Overview
        </Typography>

        <NominationHeaderChips />
      </div>

      <KeyStatsContainer />

      <NominatorStatsContainer />

      <NominationsPayoutsContainer />

      <NominationValidatorTables />
    </div>
  );
}
