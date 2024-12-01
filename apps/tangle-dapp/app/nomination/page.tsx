import { Typography } from '@webb-tools/webb-ui-components';
import { Metadata } from 'next';

import { OpenGraphPageImageUrl } from '../../constants/openGraph';
import { KeyStatsContainer } from '../../containers';
import HeaderChipsContainer from '../../containers/HeaderChipsContainer';
import ActiveAndWaitingValidatorTables from '../../containers/nomination/ActiveAndWaitingValidatorTables';
import NominationsPayoutsContainer from '../../containers/nomination/NominationsPayoutsContainer';
import NominatorStatsContainer from '../../containers/nomination/NominatorStatsContainer';
import createPageMetadata from '../../utils/createPageMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Nomination',
  imageUrl: OpenGraphPageImageUrl.Nomination,
  description:
    'Elevate your TNT tokens through NPoS by nominating validators on Tangle Network. Stake on EVM and Substrate to support network security and enjoy rewards.',
});

export default function NominationPage() {
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

      <ActiveAndWaitingValidatorTables />
    </div>
  );
}
